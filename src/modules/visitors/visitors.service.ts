import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateVisitorDto } from './dto/create-visitor.dto';
import { ApproveVisitorDto } from './dto/approve-visitor.dto';
import { CreatePreApprovalDto } from './dto/create-preapproval.dto';
import { UpdateVisitorStatusDto } from './dto/update-visitor-status.dto';

@Injectable()
export class VisitorsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createVisitor(
    societyId: string,
    flatId: string,
    dto: CreateVisitorDto,
  ) {
    const activePreApproval =
      dto.phone
        ? await this.prisma.visitorPreApproval.findFirst(
            {
              where: {
                societyId,
                flatId,
                visitorPhone: dto.phone,
                visitorType:
                  dto.visitorType,
                status: 'APPROVED',
                validUntil: {
                  gte: new Date(),
                },
              },
              orderBy: {
                validUntil: 'asc',
              },
            },
          )
        : null;

    const isAutoApproved =
      Boolean(activePreApproval) &&
      (activePreApproval?.usedEntries ?? 0) <
        (activePreApproval?.maxEntries ?? 0);

    const createdVisitor =
      await this.prisma.visitor.create({
        data: {
          societyId,

          flatId,

          name: dto.name,

          phone: dto.phone,

          visitorType:
            dto.visitorType,

          purpose: dto.purpose,

          vehicleNo:
            dto.vehicleNo,

          companyName:
            dto.companyName,

          entryGate:
            dto.entryGate,

          remarks:
            dto.remarks,

          preApprovalId:
            activePreApproval?.id,

          residentId:
            activePreApproval?.userId,

          approvalMode:
            isAutoApproved
              ? 'PRE_APPROVED'
              : null,

          status: isAutoApproved
            ? 'APPROVED'
            : 'PENDING',

          approvedAt:
            isAutoApproved
              ? new Date()
              : null,

          isInside: false,
        },

        include: {
          flat: {
            include: {
              tower: true,
            },
          },
        },
      });

    if (isAutoApproved && activePreApproval) {
      await this.prisma.visitorPreApproval.update(
        {
          where: {
            id: activePreApproval.id,
          },
          data: {
            usedEntries: {
              increment: 1,
            },
          },
        },
      );
    }

    return createdVisitor;
  }

  async approveVisitor(
    visitorId: string,
    approvedById: string,
    dto: ApproveVisitorDto,
  ) {
    const visitor =
      await this.prisma.visitor.findUnique({
        where: {
          id: visitorId,
        },
      });

    if (!visitor) {
      throw new NotFoundException(
        'Visitor not found',
      );
    }

    return this.prisma.visitor.update({
      where: {
        id: visitorId,
      },

      data: {
        status: 'APPROVED',

        approvalMode:
          dto.approvalMode,

        approvedById,

        approvedAt: new Date(),

        remarks:
          dto.remarks,
      },

      include: {
        flat: {
          include: {
            tower: true,
          },
        },

        approvedBy: true,
      },
    });
  }

  async updateVisitorStatus(
    visitorId: string,
    dto: UpdateVisitorStatusDto,
  ) {
    const visitor =
      await this.prisma.visitor.findUnique({
        where: {
          id: visitorId,
        },
      });

    if (!visitor) {
      throw new NotFoundException(
        'Visitor not found',
      );
    }

    return this.prisma.visitor.update({
      where: {
        id: visitorId,
      },

      data: {
        status: dto.status,

        isInside:
          dto.status ===
          'ENTERED',

        entryAt:
          dto.status ===
          'ENTERED'
            ? new Date()
            : visitor.entryAt,

        exitAt:
          dto.status ===
          'EXITED'
            ? new Date()
            : visitor.exitAt,

        deniedAt:
          dto.status ===
          'DENIED'
            ? new Date()
            : visitor.deniedAt,

        remarks:
          dto.remarks,
      },

      include: {
        flat: {
          include: {
            tower: true,
          },
        },
      },
    });
  }

 async createPreApproval(
  societyId: string,
  userId: string,
  flatId: string,
  dto: CreatePreApprovalDto,
) {
  const residentMapping =
    await this.prisma.residentFlat.findFirst(
      {
        where: {
          societyId,

          flatId,

          isActive: true,
        },

        include: {
          user: true,
        },
      },
    );

  if (!residentMapping) {
    throw new NotFoundException(
      'No active resident found for this flat',
    );
  }

  return this.prisma.visitorPreApproval.create(
    {
      data: {
        societyId,

        userId:
          residentMapping.user.id,

        flatId,

        visitorName:
          dto.visitorName,

        visitorPhone:
          dto.visitorPhone,

        visitorType:
          dto.visitorType,

        purpose:
          dto.purpose,

        vehicleNo:
          dto.vehicleNo,

        validUntil:
          new Date(
            dto.validUntil,
          ),

        status:
          'APPROVED',
      },

      include: {
        user: true,

        flat: {
          include: {
            tower: true,
          },
        },
      },
    },
  );
}

  async activeVisitors(
    societyId: string,
  ) {
    return this.prisma.visitor.findMany(
      {
        where: {
          societyId,

          isInside: true,
        },

        include: {
          flat: {
            include: {
              tower: true,
            },
          },

          resident: true,

          approvedBy: true,
        },

        orderBy: {
          entryAt: 'desc',
        },
      },
    );
  }

  async visitorLogs(
    societyId: string,
  ) {
    return this.prisma.visitor.findMany(
      {
        where: {
          societyId,
        },

        include: {
          flat: {
            include: {
              tower: true,
            },
          },

          resident: true,

          approvedBy: true,

          preApproval: true,
        },

        orderBy: {
          createdAt: 'desc',
        },
      },
    );
  }

  async autoDenyTimedOutVisitors(
    societyId: string,
  ) {
    const thresholdDate = new Date(
      Date.now() - 10 * 60 * 1000,
    );

    const updateResult =
      await this.prisma.visitor.updateMany(
        {
          where: {
            societyId,
            status: 'PENDING',
            createdAt: {
              lte: thresholdDate,
            },
          },
          data: {
            status: 'DENIED',
            deniedAt: new Date(),
            remarks:
              'Auto-denied after 10 minutes without resident response',
          },
        },
      );

    return {
      deniedCount:
        updateResult.count,
      thresholdDate,
    };
  }
}
