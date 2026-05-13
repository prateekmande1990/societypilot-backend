import {
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
  constructor(private readonly prisma: PrismaService) {}

  async list(societyId: string, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { societyId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { societyId } }),
    ]);
    return {
      items,
      pagination: { page, limit, total },
    };
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

    const overdueBill = await this.prisma.bill.findFirst({
      where: {
        societyId: exists.societyId,
        userId: exists.id,
        status: { not: 'PAID' },
      },
      orderBy: { dueDate: 'asc' },
    });

    if (overdueBill) {
      throw new UnprocessableEntityException(
        `Outstanding dues must be cleared before move-out. Pending bill: ${overdueBill.period} (${overdueBill.amount}).`,
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        flatId: null,
        towerId: null,
      },
    });
  }
}
