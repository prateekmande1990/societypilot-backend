import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class ResidentsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async list(
    societyId: string,
    query: PaginationQueryDto,
  ) {
    const page = query.page ?? 1;

    const limit = query.limit ?? 20;

    const skip = (page - 1) * limit;

    const [items, total] =
      await Promise.all([
        this.prisma.user.findMany({
          where: {
            societyId,
          },

          include: {
            residentFlats: {
              where: {
                isActive: true,
              },

              include: {
                flat: {
                  include: {
                    tower: true,
                  },
                },
              },
            },
          },

          orderBy: {
            createdAt: 'desc',
          },

          skip,

          take: limit,
        }),

        this.prisma.user.count({
          where: {
            societyId,
          },
        }),
      ]);

    return {
      items,

      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async create(
    societyId: string,
    flatId: string,
    dto: CreateResidentDto,
  ) {
    const flat =
      await this.prisma.flat.findUnique({
        where: {
          id: flatId,
        },

        include: {
          tower: true,
        },
      });

    if (!flat) {
      throw new NotFoundException(
        'Flat not found',
      );
    }

    if (flat.societyId !== societyId) {
      throw new BadRequestException(
        'Flat does not belong to society',
      );
    }

    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          phone: dto.phone,
        },

        include: {
          residentFlats: true,
        },
      });

    /*
     * Existing resident flow
     */
    if (existingUser) {
      const existingMapping =
        await this.prisma.residentFlat.findFirst({
          where: {
            userId: existingUser.id,

            flatId,

            isActive: true,
          },
        });

      if (existingMapping) {
        throw new BadRequestException(
          'Resident already mapped to this flat',
        );
      }

      const mapping =
        await this.prisma.residentFlat.create({
          data: {
            userId: existingUser.id,

            flatId,

            societyId,

            relationType: dto.role,

            isPrimary: false,
          },

          include: {
            user: true,
          },
        });

      const updatedFlat =
        await this.prisma.flat.update({
          where: {
            id: flat.id,
          },

          data: {
            occupancyStatus:
              'OCCUPIED',
          },

          include: {
            tower: true,
          },
        });

      return {
        message:
          'Existing resident mapped to new flat successfully',

        resident: existingUser,

        mapping: {
          ...mapping,

          flat: updatedFlat,
        },
      };
    }

    /*
     * New resident flow
     */
    const user =
      await this.prisma.user.create({
        data: {
          name: dto.name,

          phone: dto.phone,

          email: dto.email,

          role: dto.role,

          societyId,

          gender: dto.gender,

          dateOfBirth:
            dto.dateOfBirth
              ? new Date(
                  dto.dateOfBirth,
                )
              : undefined,

          profileImageUrl:
            dto.profileImageUrl,

          isVerified: false,

          isActive: true,
        },
      });

    const mapping =
      await this.prisma.residentFlat.create({
        data: {
          userId: user.id,

          flatId,

          societyId,

          relationType: dto.role,

          isPrimary: true,
        },

        include: {
          user: true,
        },
      });

    const updatedFlat =
      await this.prisma.flat.update({
        where: {
          id: flat.id,
        },

        data: {
          occupancyStatus:
            'OCCUPIED',
        },

        include: {
          tower: true,
        },
      });

    return {
      message:
        'Resident created successfully',

      resident: user,

      mapping: {
        ...mapping,

        flat: updatedFlat,
      },
    };
  }

  async update(
    societyId: string,
    flatId: string,
    residentId: string,
    dto: UpdateResidentDto,
  ) {
    const resident =
      await this.prisma.user.findUnique({
        where: {
          id: residentId,
        },
      });

    if (!resident) {
      throw new NotFoundException(
        'Resident not found',
      );
    }

    const flat =
      await this.prisma.flat.findUnique({
        where: {
          id: flatId,
        },

        include: {
          tower: true,
        },
      });

    if (!flat) {
      throw new NotFoundException(
        'Flat not found',
      );
    }

    if (flat.societyId !== societyId) {
      throw new BadRequestException(
        'Flat does not belong to society',
      );
    }

    const updatedResident =
      await this.prisma.user.update({
        where: {
          id: residentId,
        },

        data: {
          ...dto,

          dateOfBirth:
            dto.dateOfBirth
              ? new Date(
                  dto.dateOfBirth,
                )
              : undefined,
        },
      });

    await this.prisma.residentFlat.updateMany({
      where: {
        userId: residentId,

        flatId,

        isActive: true,
      },

      data: {
        relationType:
          dto.role,
      },
    });

    return updatedResident;
  }

  async flatResidents(flatId: string) {
    return this.prisma.residentFlat.findMany({
      where: {
        flatId,

        isActive: true,
      },

      include: {
        user: true,

        flat: {
          include: {
            tower: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async moveOut(residentId: string) {
    const resident =
      await this.prisma.user.findUnique({
        where: {
          id: residentId,
        },

        include: {
          residentFlats: true,
        },
      });

    if (!resident) {
      throw new NotFoundException(
        'Resident not found',
      );
    }

    const overdueBill =
      await this.prisma.bill.findFirst({
        where: {
          societyId:
            resident.societyId,

          userId: resident.id,

          status: {
            not: 'PAID',
          },
        },
      });

    if (overdueBill) {
      throw new UnprocessableEntityException(
        'Outstanding dues must be cleared before move-out.',
      );
    }

    await this.prisma.residentFlat.updateMany({
      where: {
        userId: residentId,

        isActive: true,
      },

      data: {
        isActive: false,

        moveOutDate:
          new Date(),
      },
    });

    for (const mapping of resident.residentFlats) {
      const activeResidents =
        await this.prisma.residentFlat.count({
          where: {
            flatId:
              mapping.flatId,

            isActive: true,
          },
        });

      if (activeResidents === 0) {
        await this.prisma.flat.update({
          where: {
            id: mapping.flatId,
          },

          data: {
            occupancyStatus:
              'VACANT',
          },
        });
      }
    }

    return {
      message:
        'Resident moved out successfully',
    };
  }

  async stats(societyId: string) {
    const residents =
      await this.prisma.user.findMany({
        where: {
          societyId,
        },
      });

    const totalResidents =
      residents.length;

    const owners = residents.filter(
      (r) =>
        r.role ===
          'OWNER_RESIDENT' ||
        r.role ===
          'OWNER_NONRESIDENT',
    ).length;

    const tenants = residents.filter(
      (r) =>
        r.role === 'TENANT',
    ).length;

    const activeResidents =
      residents.filter(
        (r) => r.isActive,
      ).length;

    return {
      totalResidents,

      owners,

      tenants,

      activeResidents,
    };
  }
}