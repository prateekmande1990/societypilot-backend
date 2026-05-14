import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateTowerDto } from './dto/create-tower.dto';
import { UpdateTowerDto } from './dto/update-tower.dto';

@Injectable()
export class TowersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createTower(
    societyId: string,
    dto: CreateTowerDto,
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

    const existingTower =
      await this.prisma.tower.findFirst({
        where: {
          societyId,
          name: dto.name,
        },
      });

    if (existingTower) {
      throw new BadRequestException(
        'Tower already exists',
      );
    }

    const tower =
      await this.prisma.tower.create({
        data: {
          societyId,
          name: dto.name,
          totalFloors: dto.totalFloors,
          totalFlats: dto.totalFlats,
        },
      });

    const towerCount =
      await this.prisma.tower.count({
        where: {
          societyId,
        },
      });

    if (towerCount > 0) {
      await this.prisma.societyOnboarding.update({
        where: {
          societyId,
        },
        data: {
          towersConfigured: true,
          completedPercentage: 50,
        },
      });
    }

    return tower;
  }

  async listTowers(societyId: string) {
    return this.prisma.tower.findMany({
      where: {
        societyId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async towerStats(societyId: string) {
    const towers =
      await this.prisma.tower.findMany({
        where: {
          societyId,
        },
      });

    const totalTowers = towers.length;

    const totalFloors = towers.reduce(
      (sum, tower) =>
        sum + tower.totalFloors,
      0,
    );

    const totalFlats = towers.reduce(
      (sum, tower) =>
        sum + tower.totalFlats,
      0,
    );

    return {
      totalTowers,
      totalFloors,
      totalFlats,
    };
  }

  async updateTower(
    towerId: string,
    dto: UpdateTowerDto,
  ) {
    const tower =
      await this.prisma.tower.findUnique({
        where: {
          id: towerId,
        },
      });

    if (!tower) {
      throw new NotFoundException(
        'Tower not found',
      );
    }

    return this.prisma.tower.update({
      where: {
        id: towerId,
      },
      data: dto,
    });
  }

  async deleteTower(towerId: string) {
    const tower =
      await this.prisma.tower.findUnique({
        where: {
          id: towerId,
        },
      });

    if (!tower) {
      throw new NotFoundException(
        'Tower not found',
      );
    }

    await this.prisma.tower.delete({
      where: {
        id: towerId,
      },
    });

    return {
      message:
        'Tower deleted successfully',
    };
  }
}