import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(societyId: string) {
    return this.prisma.vendor.findMany({
      where: { societyId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(societyId: string, dto: CreateVendorDto) {
    return this.prisma.vendor.create({
      data: {
        societyId,
        name: dto.name,
        category: dto.category,
        phone: dto.phone,
        email: dto.email,
        notes: dto.notes,
      },
    });
  }
}
