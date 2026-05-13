import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlatformAdminLoginDto } from './dto/platform-admin-login.dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../common/enums/role.enum';
import { CreateSocietyDto } from './dto/create-society.dto';
import { UpdateSocietyDto } from './dto/update-society.dto';

@Injectable()
export class PlatformAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: PlatformAdminLoginDto) {
    const adminEmail = process.env.PLATFORM_ADMIN_EMAIL;
    const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD;
    const adminTotp = process.env.PLATFORM_ADMIN_TOTP;

    if (
      dto.email !== adminEmail ||
      dto.password !== adminPassword ||
      dto.totp !== adminTotp
    ) {
      throw new UnauthorizedException(
        'Invalid platform admin credentials',
      );
    }

    const token = this.jwtService.sign(
      {
        userId: 'platform-admin',
        societyId: 'platform',
        role: Role.SUPER_ADMIN,
        flatId: null,
        towerId: null,
        permissions: ['*'],
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '8h',
      },
    );

    return {
      accessToken: token,
      expiresInSeconds: 8 * 60 * 60,
    };
  }

  async listSocieties(query: {
    search?: string;
    city?: string;
    state?: string;
    page: number;
    limit: number;
  }) {
    const where: any = {};

    if (query.search) {
      where.OR = [
        {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (query.city) {
      where.city = {
        equals: query.city,
        mode: 'insensitive',
      };
    }

    if (query.state) {
      where.state = {
        equals: query.state,
        mode: 'insensitive',
      };
    }

    const skip = (query.page - 1) * query.limit;

    const [societies, total] = await Promise.all([
      this.prisma.society.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              users: true,
              flats: true,
              complaints: true,
              bills: true,
            },
          },
        },
      }),
      this.prisma.society.count({ where }),
    ]);

    return {
      items: societies,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async createSociety(dto: CreateSocietyDto) {
  const generatedSlug =
    dto.slug ??
    dto.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const existingSlug = await this.prisma.society.findUnique({
    where: {
      slug: generatedSlug,
    },
  });

  if (existingSlug) {
    throw new BadRequestException(
      'Society slug already exists',
    );
  }

  const existingChairman = await this.prisma.user.findFirst({
    where: {
      OR: [
        {
          phone: dto.chairmanPhone,
        },
        {
          email: dto.chairmanEmail,
        },
      ],
    },
  });

  if (existingChairman) {
    throw new BadRequestException(
      'Chairman already exists with provided phone or email',
    );
  }

  const result = await this.prisma.$transaction(async (tx) => {
    const society = await tx.society.create({
      data: {
        name: dto.name,
        slug: generatedSlug,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        status: 'PENDING_SETUP',
      },
    });

    const chairman = await tx.user.create({
      data: {
        name: dto.chairmanName,
        phone: dto.chairmanPhone,
        email: dto.chairmanEmail,
        role: Role.CHAIRMAN,
        societyId: society.id,
        isOnboardingDone: false,
      },
    });

    const onboarding = await tx.societyOnboarding.create({
      data: {
        societyId: society.id,
        profileCompleted: true,
        chairmanCreated: true,
        towersConfigured: false,
        flatsImported: false,
        maintenanceConfigured: false,
        paymentGatewayConfigured: false,
        completedPercentage: 20,
      },
    });

    return {
      society,
      chairman,
      onboarding,
    };
  });

  return {
    message: 'Society created successfully',
    society: result.society,
    chairman: {
      id: result.chairman.id,
      name: result.chairman.name,
      phone: result.chairman.phone,
      email: result.chairman.email,
      role: result.chairman.role,
    },
    onboarding: result.onboarding,
  };
}

  async societyDetail(id: string) {
    const society = await this.prisma.society.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            createdAt: true,
          },
        },
        flats: true,
        complaints: true,
        bills: true,
        payments: true,
      },
    });

    if (!society) {
      throw new NotFoundException('Society not found');
    }

    return society;
  }

  async updateSociety(
    id: string,
    dto: UpdateSocietyDto,
  ) {
    const existing = await this.prisma.society.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Society not found');
    }

    return this.prisma.society.update({
      where: { id },
      data: dto,
    });
  }

  async updateSocietyStatus(
    id: string,
    status: string,
  ) {
    const existing = await this.prisma.society.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Society not found');
    }

    return this.prisma.society.update({
      where: { id },
      data: {
        status,
      },
    });
  }

  async societyUsers(societyId: string) {
    return this.prisma.user.findMany({
      where: {
        societyId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }
async onboardingStatus(societyId: string) {
  const onboarding =
    await this.prisma.societyOnboarding.findUnique({
      where: {
        societyId,
      },
    });

  if (!onboarding) {
    throw new NotFoundException(
      'Onboarding not found',
    );
  }

  return onboarding;
}

async completeTowers(societyId: string) {
  return this.updateOnboardingProgress(
    societyId,
    {
      towersConfigured: true,
    },
  );
}

async completeFlats(societyId: string) {
  return this.updateOnboardingProgress(
    societyId,
    {
      flatsImported: true,
    },
  );
}

async completeMaintenance(societyId: string) {
  return this.updateOnboardingProgress(
    societyId,
    {
      maintenanceConfigured: true,
    },
  );
}

async completePaymentGateway(societyId: string) {
  return this.updateOnboardingProgress(
    societyId,
    {
      paymentGatewayConfigured: true,
    },
  );
}

private async updateOnboardingProgress(
  societyId: string,
  updates: Partial<{
    towersConfigured: boolean;
    flatsImported: boolean;
    maintenanceConfigured: boolean;
    paymentGatewayConfigured: boolean;
  }>,
) {
  const existing =
    await this.prisma.societyOnboarding.findUnique({
      where: {
        societyId,
      },
    });

  if (!existing) {
    throw new NotFoundException(
      'Onboarding not found',
    );
  }

  const updated =
    await this.prisma.societyOnboarding.update({
      where: {
        societyId,
      },
      data: {
        ...updates,
      },
    });

  const completedSteps = [
    updated.profileCompleted,
    updated.chairmanCreated,
    updated.towersConfigured,
    updated.flatsImported,
    updated.maintenanceConfigured,
    updated.paymentGatewayConfigured,
  ].filter(Boolean).length;

  const completedPercentage =
    Math.round((completedSteps / 6) * 100);

  const finalOnboarding =
    await this.prisma.societyOnboarding.update({
      where: {
        societyId,
      },
      data: {
        completedPercentage,
      },
    });

  if (completedPercentage === 100) {
    await this.prisma.society.update({
      where: {
        id: societyId,
      },
      data: {
        status: 'ACTIVE',
      },
    });
  }

  return finalOnboarding;
}
  async impersonate(societyId: string) {
    const society = await this.prisma.society.findUnique({
      where: {
        id: societyId,
      },
    });

    if (!society) {
      throw new NotFoundException('Society not found');
    }

    const token = this.jwtService.sign(
      {
        userId: 'platform-admin',
        societyId,
        role: Role.SUPER_ADMIN,
        flatId: null,
        towerId: null,
        permissions: ['*'],
        impersonation: true,
      },
      {
        secret: process.env.JWT_SECRET ?? 'dev-secret',
        expiresIn: '30m',
      },
    );

    return {
      accessToken: token,
      expiresInSeconds: 30 * 60,
      impersonation: true,
      society: {
        id: society.id,
        name: society.name,
        slug: society.slug,
      },
    };
  }
}