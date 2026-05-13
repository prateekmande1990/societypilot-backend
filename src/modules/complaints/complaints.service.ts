import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class ComplaintsService implements OnModuleInit, OnModuleDestroy {
  private escalationTimer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    const enabled = (process.env.COMPLAINT_ESCALATION_ENABLED ?? 'true') === 'true';
    if (!enabled) return;

    const intervalMs = Number(process.env.COMPLAINT_ESCALATION_INTERVAL_MS ?? 10 * 60 * 1000);
    this.escalationTimer = setInterval(() => {
      void this.runAutoEscalation();
    }, intervalMs);
  }

  onModuleDestroy() {
    if (this.escalationTimer) {
      clearInterval(this.escalationTimer);
    }
  }

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
    const canViewAnonymousIdentity = [
      Role.SUPER_ADMIN,
      Role.CHAIRMAN,
      Role.SECRETARY,
    ].includes(user.role as Role);

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
    const normalizedItems = items.map((item) => {
      if (!item.isAnonymous || canViewAnonymousIdentity) return item;
      return {
        ...item,
        user: {
          ...item.user,
          name: 'Anonymous',
          phone: null,
          email: null,
        },
      };
    });

    return { items: normalizedItems, pagination: { page, limit, total } };
  }

  async updateStatus(user: JwtPayload, id: string, dto: UpdateComplaintStatusDto) {
    const complaint = await this.prisma.complaint.findUnique({ where: { id } });
    if (!complaint) throw new NotFoundException('Complaint not found');

    const isClosing = dto.status === 'CLOSED';
    const isPrivilegedCloser = [Role.CHAIRMAN, Role.SECRETARY].includes(
      user.role as Role,
    );
    const isRequester = complaint.userId === user.userId;
    if (isClosing && !isPrivilegedCloser && !isRequester) {
      throw new ForbiddenException(
        'Only the complaint requester, Secretary, or Chairman can close a complaint',
      );
    }

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

  async runAutoEscalation(societyId?: string) {
    const now = Date.now();
    const staleOpenBefore = new Date(now - 24 * 60 * 60 * 1000);
    const staleAssignedBefore = new Date(now - 48 * 60 * 60 * 1000);

    const whereSociety = societyId ? { societyId } : {};

    // Rule: OPEN with no progress after 24h -> escalate to secretary tier.
    const secretaryEscalation = await this.prisma.complaint.updateMany({
      where: {
        ...whereSociety,
        status: 'OPEN',
        createdAt: { lt: staleOpenBefore },
        escalatedAt: null,
      },
      data: {
        escalatedAt: new Date(),
        priority: 'HIGH',
      },
    });

    // Rule: Assigned/In-progress without update for 48h -> chairman tier.
    const chairmanEscalation = await this.prisma.complaint.updateMany({
      where: {
        ...whereSociety,
        status: { in: ['ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS'] },
        updatedAt: { lt: staleAssignedBefore },
        priority: { not: 'CRITICAL' },
      },
      data: {
        escalatedAt: new Date(),
        priority: 'CRITICAL',
      },
    });

    return {
      secretaryEscalated: secretaryEscalation.count,
      chairmanEscalated: chairmanEscalation.count,
      ranAt: new Date().toISOString(),
      scope: societyId ?? 'all-societies',
    };
  }
}
