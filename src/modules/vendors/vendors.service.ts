import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(societyId: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = { societyId, isActive: true };
    const [items, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.vendor.count({ where }),
    ]);
    return { items, pagination: { page, limit, total } };
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
