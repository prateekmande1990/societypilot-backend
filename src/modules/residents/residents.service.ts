import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';

@Injectable()
export class ResidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(societyId: string) {
    return this.prisma.user.findMany({
      where: { societyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateResidentDto) {
    return this.prisma.user.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        role: dto.role,
        societyId: dto.societyId,
        flatId: dto.flatId,
        towerId: dto.towerId,
      },
    });
  }

  async update(id: string, dto: UpdateResidentDto) {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Resident not found');
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async moveOut(id: string) {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Resident not found');
    return this.prisma.user.update({
      where: { id },
      data: {
        flatId: null,
        towerId: null,
      },
    });
  }
}
