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
    return this.prisma.visitor.create({
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

        status: 'PENDING',

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
}