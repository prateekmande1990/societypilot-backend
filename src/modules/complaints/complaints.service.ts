import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

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

  async list(user: JwtPayload) {
    return this.prisma.complaint.findMany({
      where: { societyId: user.societyId },
      include: { user: true, flat: true },
      orderBy: { createdAt: 'desc' },
    });
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
