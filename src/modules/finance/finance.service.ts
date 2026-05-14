import {
  Injectable,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { GenerateBillsDto } from './dto/generate-bills.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

import {
  createHmac,
  timingSafeEqual,
} from 'crypto';

import { InjectQueue } from '@nestjs/bullmq';

import { Queue } from 'bullmq';

import {
  BILLING_GENERATE_JOB,
  BILLING_QUEUE,
} from './finance.constants';

import { RuntimeStoreService } from '../../common/services/runtime-store.service';

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly store: RuntimeStoreService,

    @Optional()
    @InjectQueue(BILLING_QUEUE)
    private readonly billingQueue?: Queue,
  ) {}

  async listBills(
    societyId: string,
    query: PaginationQueryDto,
  ) {
    const page =
      query.page ?? 1;

    const limit =
      query.limit ?? 20;

    const skip =
      (page - 1) * limit;

    const [items, total] =
      await Promise.all([
        this.prisma.bill.findMany({
          where: {
            societyId,
          },

          include: {
            user: true,

            flat: {
              include: {
                tower: true,
              },
            },
          },

          orderBy: {
            createdAt: 'desc',
          },

          skip,

          take: limit,
        }),

        this.prisma.bill.count({
          where: {
            societyId,
          },
        }),
      ]);

    return {
      items,

      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async generateBills(
    societyId: string,
    dto: GenerateBillsDto,
  ) {
    /*
     * Redis optional fallback
     */
    if (!process.env.REDIS_URL) {
      const result =
        await this.executeBillGeneration(
          societyId,
          dto,
        );

      return {
        mode: 'sync',
        ...result,
      };
    }

    const job =
      await this.billingQueue?.add(
        BILLING_GENERATE_JOB,
        {
          societyId,

          period: dto.period,

          amount: dto.amount,

          dueDate: dto.dueDate,
        },
        {
          attempts: 3,

          removeOnComplete: 500,

          removeOnFail: 500,
        },
      );

    if (!job) {
      const result =
        await this.executeBillGeneration(
          societyId,
          dto,
        );

      return {
        mode: 'sync',
        ...result,
      };
    }

    const jobId = String(job.id);

    await this.store.set(
      this.billGenStatusKey(
        societyId,
        jobId,
      ),

      JSON.stringify({
        jobId,

        status: 'queued',

        processed: 0,

        progressPercent: 0,
      }),

      24 * 60 * 60,
    );

    return {
      mode: 'queue',

      jobId,

      status: 'queued',
    };
  }

  async getBillGenerationStatus(
    societyId: string,
    jobId: string,
  ) {
    const stateRaw =
      await this.store.get(
        this.billGenStatusKey(
          societyId,
          jobId,
        ),
      );

    if (!stateRaw) {
      return {
        jobId,

        status: 'unknown',
      };
    }

    return JSON.parse(
      stateRaw,
    ) as Record<
      string,
      unknown
    >;
  }

  async executeBillGeneration(
    societyId: string,
    dto: GenerateBillsDto,
    onProgress?: (
      processed: number,
      total: number,
    ) => Promise<void>,
  ) {
    const mappings =
      await this.prisma.residentFlat.findMany({
        where: {
          societyId,

          isActive: true,
        },

        include: {
          user: true,

          flat: true,
        },
      });

    const dueDate =
      dto.dueDate
        ? new Date(dto.dueDate)
        : new Date();

    dueDate.setDate(
      dueDate.getDate() + 15,
    );

    let processed = 0;

    for (const mapping of mappings) {
      await this.prisma.bill.create({
        data: {
          societyId,

          userId:
            mapping.userId,

          flatId:
            mapping.flatId,

          period: dto.period,

          amount: dto.amount,

          dueDate,
        },
      });

      processed += 1;

      if (onProgress) {
        await onProgress(
          processed,
          mappings.length,
        );
      }
    }

    return {
      generatedCount:
        processed,

      period: dto.period,
    };
  }

  async recordPayment(
    societyId: string,
    dto: RecordPaymentDto,
  ) {
    if (dto.billId) {
      const bill =
        await this.prisma.bill.findUnique({
          where: {
            id: dto.billId,
          },
        });

      if (!bill) {
        throw new NotFoundException(
          'Bill not found',
        );
      }
    }

    const payment =
      await this.prisma.payment.create({
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
        where: {
          id: dto.billId,
        },

        data: {
          status: 'PAID',
        },
      });
    }

    return payment;
  }

  async listDefaulters(
    societyId: string,
  ) {
    const overdueBills =
      await this.prisma.bill.findMany({
        where: {
          societyId,

          status: {
            not: 'PAID',
          },

          dueDate: {
            lt: new Date(),
          },
        },

        include: {
          user: true,

          flat: {
            include: {
              tower: true,
            },
          },
        },

        orderBy: {
          dueDate: 'asc',
        },
      });

    return overdueBills.map(
      (bill) => {
        const msDiff =
          Date.now() -
          bill.dueDate.getTime();

        const daysOverdue =
          Math.floor(
            msDiff /
              (1000 *
                60 *
                60 *
                24),
          );

        return {
          billId: bill.id,

          residentName:
            bill.user.name,

          flatNumber:
            bill.flat.flatNumber,

          tower:
            bill.flat.tower,

          amountDue:
            bill.amount,

          period:
            bill.period,

          daysOverdue,
        };
      },
    );
  }

  async pnl(
    societyId: string,
  ) {
    const [
      incomeAgg,
      billedAgg,
    ] = await Promise.all([
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
          amount: true,
        },
      }),
    ]);

    const income = Number(
      incomeAgg._sum.amount ??
        0,
    );

    const billed = Number(
      billedAgg._sum.amount ??
        0,
    );

    return {
      period: 'current',

      totalBilled: billed,

      totalCollected:
        income,

      outstanding:
        billed - income,
    };
  }

  async razorpayWebhook(
    signature:
      | string
      | undefined,

    payload: Record<
      string,
      unknown
    >,
  ) {
    const secret =
      process.env
        .RAZORPAY_WEBHOOK_SECRET ??
      '';

    if (secret) {
      if (!signature) {
        throw new UnauthorizedException(
          'Missing Razorpay webhook signature',
        );
      }

      const expected =
        createHmac(
          'sha256',
          secret,
        )
          .update(
            JSON.stringify(
              payload,
            ),
          )
          .digest('hex');

      const a =
        Buffer.from(signature);

      const b =
        Buffer.from(expected);

      if (
        a.length !==
          b.length ||
        !timingSafeEqual(a, b)
      ) {
        throw new UnauthorizedException(
          'Invalid Razorpay webhook signature',
        );
      }
    }

    return {
      received: true,

      message:
        'Webhook accepted',
    };
  }

  private billGenStatusKey(
    societyId: string,
    jobId: string,
  ) {
    return `finance:billgen:${societyId}:${jobId}`;
  }
}