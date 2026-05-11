import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async chairman(user: JwtPayload) {
    const [residentCount, openComplaints, pendingDocuments, todayVisitors] =
      await Promise.all([
        this.prisma.user.count({ where: { societyId: user.societyId } }),
        this.prisma.complaint.count({
          where: { societyId: user.societyId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
        }),
        this.prisma.documentRequest.count({
          where: { societyId: user.societyId, status: 'PENDING' },
        }),
        this.prisma.visitor.count({
          where: {
            societyId: user.societyId,
            entryAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
      ]);

    return { residentCount, openComplaints, pendingDocuments, todayVisitors };
  }

  async treasurer(user: JwtPayload) {
    const [billedAgg, collectedAgg, overdueCount] = await Promise.all([
      this.prisma.bill.aggregate({
        where: { societyId: user.societyId },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { societyId: user.societyId, status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.bill.count({
        where: {
          societyId: user.societyId,
          status: { not: 'PAID' },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    const totalBilled = Number(billedAgg._sum.amount ?? 0);
    const totalCollected = Number(collectedAgg._sum.amount ?? 0);
    return {
      totalBilled,
      totalCollected,
      outstanding: totalBilled - totalCollected,
      overdueBills: overdueCount,
    };
  }

  async resident(user: JwtPayload) {
    const [myComplaints, myPendingDocs, myPendingBills] = await Promise.all([
      this.prisma.complaint.count({ where: { societyId: user.societyId, userId: user.userId } }),
      this.prisma.documentRequest.count({
        where: { societyId: user.societyId, userId: user.userId, status: 'PENDING' },
      }),
      this.prisma.bill.count({
        where: { societyId: user.societyId, userId: user.userId, status: { not: 'PAID' } },
      }),
    ]);

    return { myComplaints, myPendingDocs, myPendingBills };
  }
}
