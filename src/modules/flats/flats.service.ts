import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateFlatDto } from './dto/create-flat.dto';
import { UpdateFlatDto } from './dto/update-flat.dto';

@Injectable()
export class FlatsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createFlat(
    societyId: string,
    dto: CreateFlatDto,
  ) {
    const society =
      await this.prisma.society.findUnique({
        where: {
          id: societyId,
        },
      });

    if (!society) {
      throw new NotFoundException(
        'Society not found',
      );
    }

    const tower =
      await this.prisma.tower.findUnique({
        where: {
          id: dto.towerId,
        },
      });

    if (!tower) {
      throw new NotFoundException(
        'Tower not found',
      );
    }

    const existingFlat =
      await this.prisma.flat.findFirst({
        where: {
          towerId: dto.towerId,
          flatNumber: dto.flatNumber,
        },
      });

    if (existingFlat) {
      throw new BadRequestException(
        'Flat already exists in this tower',
      );
    }

    const flat =
      await this.prisma.flat.create({
        data: {
          societyId,
          towerId: dto.towerId,
          flatNumber: dto.flatNumber,
          floor: dto.floor,
          type: dto.type,
          areaSqFt: dto.areaSqFt,
          occupancyStatus:
            dto.occupancyStatus ?? 'VACANT',
        },
      });

    const flatCount =
      await this.prisma.flat.count({
        where: {
          societyId,
        },
      });

    if (flatCount > 0) {
      await this.prisma.societyOnboarding.update({
        where: {
          societyId,
        },
        data: {
          flatsImported: true,
          completedPercentage: 67,
        },
      });
    }

    return flat;
  }

  async listFlats(societyId: string) {
    return this.prisma.flat.findMany({
      where: {
        societyId,
      },
      include: {
        tower: true,
      },
      orderBy: [
        {
          floor: 'asc',
        },
        {
          flatNumber: 'asc',
        },
      ],
    });
  }

  async flatStats(societyId: string) {
    const flats =
      await this.prisma.flat.findMany({
        where: {
          societyId,
        },
      });

    const totalFlats = flats.length;

    const occupiedFlats = flats.filter(
      (flat) =>
        flat.occupancyStatus === 'OCCUPIED',
    ).length;

    const vacantFlats = flats.filter(
      (flat) =>
        flat.occupancyStatus === 'VACANT',
    ).length;

    return {
      totalFlats,
      occupiedFlats,
      vacantFlats,
    };
  }

  async updateFlat(
    flatId: string,
    dto: UpdateFlatDto,
  ) {
    const flat =
      await this.prisma.flat.findUnique({
        where: {
          id: flatId,
        },
      });

    if (!flat) {
      throw new NotFoundException(
        'Flat not found',
      );
    }

    return this.prisma.flat.update({
      where: {
        id: flatId,
      },
      data: dto,
    });
  }

  async deleteFlat(flatId: string) {
    const flat =
      await this.prisma.flat.findUnique({
        where: {
          id: flatId,
        },
      });

    if (!flat) {
      throw new NotFoundException(
        'Flat not found',
      );
    }

    await this.prisma.flat.delete({
      where: {
        id: flatId,
      },
    });

    return {
      message:
        'Flat deleted successfully',
    };
  }
}