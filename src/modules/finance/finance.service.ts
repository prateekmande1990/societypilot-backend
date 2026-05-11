import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GenerateBillsDto } from './dto/generate-bills.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async listBills(societyId: string) {
    return this.prisma.bill.findMany({
      where: { societyId },
      include: { user: true, flat: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateBills(societyId: string, dto: GenerateBillsDto) {
    const residents = await this.prisma.user.findMany({
      where: { societyId, flatId: { not: null } },
    });

    const dueDate = dto.dueDate ? new Date(dto.dueDate) : new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    const created = await this.prisma.$transaction(
      residents.map((resident) =>
        this.prisma.bill.create({
          data: {
            societyId,
            userId: resident.id,
            flatId: resident.flatId!,
            period: dto.period,
            amount: dto.amount,
            dueDate,
          },
        }),
      ),
    );

    return { generatedCount: created.length, period: dto.period };
  }

  async recordPayment(societyId: string, dto: RecordPaymentDto) {
    if (dto.billId) {
      const bill = await this.prisma.bill.findUnique({ where: { id: dto.billId } });
      if (!bill) throw new NotFoundException('Bill not found');
    }

    const payment = await this.prisma.payment.create({
      data: {
        societyId,
        userId: dto.userId,
        billId: dto.billId,
        amount: dto.amount,
        method: dto.method,
        status: 'SUCCESS',
      },
    });

    if (dto.billId) {
      await this.prisma.bill.update({
        where: { id: dto.billId },
        data: { status: 'PAID' },
      });
    }

    return payment;
  }

  async listDefaulters(societyId: string) {
    const overdueBills = await this.prisma.bill.findMany({
      where: {
        societyId,
        status: { not: 'PAID' },
        dueDate: { lt: new Date() },
      },
      include: { user: true, flat: true },
      orderBy: { dueDate: 'asc' },
    });

    return overdueBills.map((bill) => {
      const msDiff = Date.now() - bill.dueDate.getTime();
      const daysOverdue = Math.floor(msDiff / (1000 * 60 * 60 * 24));
      return {
        billId: bill.id,
        residentName: bill.user.name,
        flatNumber: bill.flat.flatNumber,
        tower: bill.flat.tower,
        amountDue: bill.amount,
        period: bill.period,
        daysOverdue,
      };
    });
  }

  async pnl(societyId: string) {
    const [incomeAgg, billedAgg] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { societyId, status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.bill.aggregate({
        where: { societyId },
        _sum: { amount: true },
      }),
    ]);

    const income = Number(incomeAgg._sum.amount ?? 0);
    const billed = Number(billedAgg._sum.amount ?? 0);
    return {
      period: 'current',
      totalBilled: billed,
      totalCollected: income,
      outstanding: billed - income,
    };
  }

  razorpayWebhook(payload: Record<string, unknown>) {
    return {
      received: true,
      message: 'Webhook accepted',
      event: payload?.event ?? null,
    };
  }
}
