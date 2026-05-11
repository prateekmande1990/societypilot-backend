import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  async raise(user: JwtPayload, dto: CreateComplaintDto) {
    return this.prisma.complaint.create({
      data: {
        societyId: user.societyId,
        userId: user.userId,
        flatId: dto.flatId ?? user.flatId ?? null,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        priority: dto.priority ?? 'MEDIUM',
        isAnonymous: dto.isAnonymous ?? false,
      },
    });
  }

  async list(user: JwtPayload, query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where: { societyId: user.societyId },
        include: { user: true, flat: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.complaint.count({ where: { societyId: user.societyId } }),
    ]);
    return { items, pagination: { page, limit, total } };
  }

  async updateStatus(id: string, dto: UpdateComplaintStatusDto) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');
    return this.prisma.complaint.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async escalate(id: string) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');
    return this.prisma.complaint.update({
      where: { id },
      data: { escalatedAt: new Date(), priority: 'HIGH' },
    });
  }
}
