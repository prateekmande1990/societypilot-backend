import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { BILLING_QUEUE } from './finance.constants';
import { BillingProcessor } from './processors/billing.processor';

const useRedis = Boolean(process.env.REDIS_URL);

@Module({
  imports: [
    PrismaModule,
    ...(useRedis ? [BullModule.registerQueue({ name: BILLING_QUEUE })] : []),
  ],
  controllers: [FinanceController],
  providers: [FinanceService, ...(useRedis ? [BillingProcessor] : [])],
})
export class FinanceModule {}
