import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlatformAdminLoginDto } from './dto/platform-admin-login.dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../common/enums/role.enum';
import { CreateSocietyDto } from './dto/create-society.dto';

@Injectable()
export class PlatformAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  login(dto: PlatformAdminLoginDto) {
    const adminEmail = process.env.PLATFORM_ADMIN_EMAIL;
    const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD ;
    const adminTotp = process.env.PLATFORM_ADMIN_TOTP ;

    if (
      dto.email !== adminEmail ||
      dto.password !== adminPassword ||
      dto.totp !== adminTotp
    ) {
      throw new UnauthorizedException('Invalid platform admin credentials');
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

    return { accessToken: token, expiresInSeconds: 8 * 60 * 60 };
  }

  listSocieties() {
    return this.prisma.society.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true, flats: true },
        },
      },
    });
  }

  createSociety(dto: CreateSocietyDto) {
    return this.prisma.society.create({ data: dto });
  }

  societyDetail(id: string) {
    return this.prisma.society.findUnique({
      where: { id },
      include: {
        users: true,
        flats: true,
      },
    });
  }

  impersonate(societyId: string) {
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
    };
  }
}
