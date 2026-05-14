import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

type DashboardUser = {
  societyId: string;

  userId?: string;

  role?: string;
};

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async summary(
    societyId: string,
  ) {
    const [
      totalResidents,
      totalFlats,
      occupiedFlats,
      pendingComplaints,
      billedAgg,
      collectedAgg,
      dueAgg,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          societyId,
        },
      }),

      this.prisma.flat.count({
        where: {
          societyId,
        },
      }),

      this.prisma.flat.count({
        where: {
          societyId,

          occupancyStatus:
            'OCCUPIED',
        },
      }),

      this.prisma.complaint.count({
        where: {
          societyId,

          status: {
            not: 'RESOLVED',
          },
        },
      }),

      this.prisma.bill.aggregate({
        where: {
          societyId,
        },

        _sum: {
          totalAmount: true,
        },
      }),

      this.prisma.payment.aggregate({
        where: {
          societyId,

          status: 'SUCCESS',
        },

        _sum: {
          amount: true,
        },
      }),

      this.prisma.bill.aggregate({
        where: {
          societyId,
        },

        _sum: {
          dueAmount: true,
        },
      }),
    ]);

    return {
      residents:
        totalResidents,

      flats: totalFlats,

      occupiedFlats,

      vacantFlats:
        totalFlats -
        occupiedFlats,

      pendingComplaints,

      finance: {
        totalBilled: Number(
          billedAgg._sum
            ?.totalAmount ?? 0,
        ),

        totalCollected:
          Number(
            collectedAgg._sum
              ?.amount ?? 0,
          ),

        outstanding:
          Number(
            dueAgg._sum
              ?.dueAmount ?? 0,
          ),
      },
    };
  }

  async chairman(
    user: DashboardUser,
  ) {
    return this.summary(
      user.societyId,
    );
  }

  async treasurer(
    user: DashboardUser,
  ) {
    return this.summary(
      user.societyId,
    );
  }

  async resident(
    user: DashboardUser,
  ) {
    return this.summary(
      user.societyId,
    );
  }
}