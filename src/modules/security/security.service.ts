import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SecurityService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createVisitorEntry(
    societyId: string,
    dto: {
      name: string;
      phone?: string;
      purpose?: string;
      vehicleNo?: string;
    },
  ) {
    return this.prisma.visitor.create({
      data: {
        societyId,

        name: dto.name,

        phone: dto.phone,

        purpose: dto.purpose,

        vehicleNo:
          dto.vehicleNo,

        visitorType: 'GUEST',

        status: 'PENDING',

        isInside: false,
      },
    });
  }

  async createPreApproval(
    societyId: string,
    userId: string,
    dto: {
      visitorName: string;
      visitorPhone?: string;
      purpose?: string;
      validUntil: string;
    },
  ) {
    return this.prisma.visitorPreApproval.create(
      {
        data: {
          societyId,

          userId,

          visitorName:
            dto.visitorName,

          visitorPhone:
            dto.visitorPhone,

          purpose:
            dto.purpose,

          visitorType:
            'GUEST',

          validUntil:
            new Date(
              dto.validUntil,
            ),

          status:
            'APPROVED',
        },
      },
    );
  }

  async approveVisitor(
    visitorId: string,
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

        approvedAt: new Date(),
      },
    });
  }

  async checkInVisitor(
    visitorId: string,
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
        status: 'ENTERED',

        isInside: true,

        entryAt: new Date(),
      },
    });
  }

  async checkOutVisitor(
    visitorId: string,
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
        status: 'EXITED',

        isInside: false,

        exitAt: new Date(),
      },
    });
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

        orderBy: {
          entryAt: 'desc',
        },
      },
    );
  }
}