import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import {
  ComplaintPriority,
  ComplaintStatus,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateComplaintDto } from './dto/create-complaint.dto';

import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';

import { JwtPayload } from '../auth/types/jwt-payload.type';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

import { Role } from '../../common/enums/role.enum';

@Injectable()
export class ComplaintsService
  implements OnModuleInit, OnModuleDestroy
{
  private escalationTimer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    const enabled =
      (
        process.env
          .COMPLAINT_ESCALATION_ENABLED ??
        'true'
      ) === 'true';

    if (!enabled) return;

    const intervalMs = Number(
      process.env
        .COMPLAINT_ESCALATION_INTERVAL_MS ??
        10 * 60 * 1000,
    );

    this.escalationTimer =
      setInterval(() => {
        void this.runAutoEscalation();
      }, intervalMs);
  }

  onModuleDestroy() {
    if (this.escalationTimer) {
      clearInterval(
        this.escalationTimer,
      );
    }
  }

  async raise(
    user: JwtPayload,

    flatId: string,

    dto: CreateComplaintDto,
  ) {
    const flat =
      await this.prisma.flat.findFirst({
        where: {
          id: flatId,

          societyId:
            user.societyId,
        },
      });

    if (!flat) {
      throw new NotFoundException(
        'Flat not found',
      );
    }

    const count =
      await this.prisma.complaint.count();

    const ticketNumber = `CMP-${new Date().getFullYear()}-${String(
      count + 1,
    ).padStart(5, '0')}`;

    return this.prisma.complaint.create({
      data: {
        societyId:
          user.societyId,

        userId:
          user.userId ,

        flatId,

        title:
          dto.title,

        description:
          dto.description,

        category:
          dto.category,

        priority:
          dto.priority ??
          ComplaintPriority.MEDIUM,

        status:
          ComplaintStatus.OPEN,

        ticketNumber,

        isAnonymous:
          dto.isAnonymous ??
          false,

        attachmentUrls: [],
      },

      include: {
        user: true,

        flat: {
          include: {
            tower: true,
          },
        },
      },
    });
  }

  async list(
    user: JwtPayload,

    flatId: string,

    query: PaginationQueryDto,
  ) {
    const page =
      query.page ?? 1;

    const limit =
      query.limit ?? 20;

    const skip =
      (page - 1) * limit;

    const canViewAnonymousIdentity =
      [
        Role.SUPER_ADMIN,
        Role.CHAIRMAN,
        Role.SECRETARY,
      ].includes(
        user.role as Role,
      );

    const [items, total] =
      await Promise.all([
        this.prisma.complaint.findMany(
          {
            where: {
              societyId:
                user.societyId,

              flatId,
            },

            include: {
              user: true,

              flat: {
                include: {
                  tower: true,
                },
              },

              assignedTo: true,

              vendor: true,

              comments: true,

              activities: true,
            },

            orderBy: {
              createdAt: 'desc',
            },

            skip,

            take: limit,
          },
        ),

        this.prisma.complaint.count(
          {
            where: {
              societyId:
                user.societyId,

              flatId,
            },
          },
        ),
      ]);

    const normalizedItems =
      items.map((item) => {
        if (
          !item.isAnonymous ||
          canViewAnonymousIdentity
        ) {
          return item;
        }

        return {
          ...item,

          user: {
            ...item.user,

            name:
              'Anonymous',

            phone: null,

            email: null,
          },
        };
      });

    return {
      items:
        normalizedItems,

      pagination: {
        page,

        limit,

        total,
      },
    };
  }

  async updateStatus(
    user: JwtPayload,

    id: string,

    dto: UpdateComplaintStatusDto,
  ) {
    const complaint =
      await this.prisma.complaint.findUnique(
        {
          where: { id },
        },
      );

    if (!complaint) {
      throw new NotFoundException(
        'Complaint not found',
      );
    }

    const isClosing =
      dto.status ===
      ComplaintStatus.CLOSED;

    const isPrivilegedCloser =
      [
        Role.CHAIRMAN,
        Role.SECRETARY,
      ].includes(
        user.role as Role,
      );

    const isRequester =
      complaint.userId ===
      user.userId;

    if (
      isClosing &&
      !isPrivilegedCloser &&
      !isRequester
    ) {
      throw new ForbiddenException(
        'Only complaint requester, Secretary, or Chairman can close complaint',
      );
    }

    return this.prisma.complaint.update({
      where: { id },

      data: {
        status:
          dto.status,

        lastActivityAt:
          new Date(),

        resolvedAt:
          dto.status ===
          ComplaintStatus.RESOLVED
            ? new Date()
            : null,

        closedAt:
          dto.status ===
          ComplaintStatus.CLOSED
            ? new Date()
            : null,

        reopenedAt:
          dto.status ===
          ComplaintStatus.REOPENED
            ? new Date()
            : null,
      },
    });
  }

  async close(
  user: JwtPayload,

  complaintId: string,
) {
  const complaint =
    await this.prisma.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

  if (!complaint) {
    throw new NotFoundException(
      'Complaint not found',
    );
  }

  const isAdmin =
    [
      Role.CHAIRMAN,
      Role.SECRETARY,
      Role.JOINT_SECRETARY,
    ].includes(
      user.role as Role,
    );

  const isOwner =
    complaint.userId ===
    user.userId;

  if (!isAdmin && !isOwner) {
    throw new ForbiddenException(
      'You cannot close this complaint',
    );
  }

  return this.prisma.complaint.update({
    where: {
      id: complaintId,
    },

    data: {
      status: 'CLOSED',

      closedAt: new Date(),

      lastActivityAt:
        new Date(),
    },
  });
}

async reopen(
  user: JwtPayload,

  complaintId: string,
) {
  const complaint =
    await this.prisma.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

  if (!complaint) {
    throw new NotFoundException(
      'Complaint not found',
    );
  }

  const isAdmin =
    [
      Role.CHAIRMAN,
      Role.SECRETARY,
      Role.JOINT_SECRETARY,
    ].includes(
      user.role as Role,
    );

  const isOwner =
    complaint.userId ===
    user.userId;

  if (!isAdmin && !isOwner) {
    throw new ForbiddenException(
      'You cannot reopen this complaint',
    );
  }

  return this.prisma.complaint.update({
    where: {
      id: complaintId,
    },

    data: {
      status: 'REOPENED',

      reopenedAt:
        new Date(),

      closedAt: null,

      resolvedAt: null,

      lastActivityAt:
        new Date(),
    },
  });
}

  async escalate(
    id: string,
  ) {
    const complaint =
      await this.prisma.complaint.findUnique(
        {
          where: { id },
        },
      );

    if (!complaint) {
      throw new NotFoundException(
        'Complaint not found',
      );
    }

    return this.prisma.complaint.update({
      where: { id },

      data: {
        escalatedAt:
          new Date(),

        priority:
          ComplaintPriority.HIGH,
      },
    });
  }

  async runAutoEscalation(
    societyId?: string,
  ) {
    const now =
      Date.now();

    const staleOpenBefore =
      new Date(
        now -
          24 *
            60 *
            60 *
            1000,
      );

    const staleAssignedBefore =
      new Date(
        now -
          48 *
            60 *
            60 *
            1000,
      );

    const whereSociety =
      societyId
        ? { societyId }
        : {};

    const secretaryEscalation =
      await this.prisma.complaint.updateMany(
        {
          where: {
            ...whereSociety,

            status:
              ComplaintStatus.OPEN,

            createdAt: {
              lt: staleOpenBefore,
            },

            escalatedAt:
              null,
          },

          data: {
            escalatedAt:
              new Date(),

            priority:
              ComplaintPriority.HIGH,
          },
        },
      );

    const chairmanEscalation =
      await this.prisma.complaint.updateMany(
        {
          where: {
            ...whereSociety,

            status: {
              in: [
                ComplaintStatus.ASSIGNED,
                ComplaintStatus.IN_PROGRESS,
                ComplaintStatus.ON_HOLD,
              ],
            },

            updatedAt: {
              lt: staleAssignedBefore,
            },

            priority: {
              not:
                ComplaintPriority.CRITICAL,
            },
          },

          data: {
            escalatedAt:
              new Date(),

            priority:
              ComplaintPriority.CRITICAL,
          },
        },
      );

    return {
      secretaryEscalated:
        secretaryEscalation.count,

      chairmanEscalated:
        chairmanEscalation.count,

      ranAt:
        new Date().toISOString(),

      scope:
        societyId ??
        'all-societies',
    };
  }
}