import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BILLING_GENERATE_JOB, BILLING_QUEUE } from '../finance.constants';
import { FinanceService } from '../finance.service';
import { RuntimeStoreService } from '../../../common/services/runtime-store.service';

type GenerateBillJobData = {
  societyId: string;
  period: string;
  amount: number;
  dueDate?: string;
};

@Processor(BILLING_QUEUE)
export class BillingProcessor extends WorkerHost {
  constructor(
    private readonly financeService: FinanceService,
    private readonly store: RuntimeStoreService,
  ) {
    super();
  }

  async process(job: Job<GenerateBillJobData>) {
    if (job.name !== BILLING_GENERATE_JOB) return null;

    const statusKey = this.statusKey(job.data.societyId, job.id ?? '');
    await this.store.set(
      statusKey,
      JSON.stringify({
        jobId: job.id,
        status: 'processing',
        processed: 0,
      }),
      24 * 60 * 60,
    );

    const result = await this.financeService.executeBillGeneration(
      job.data.societyId,
      {
        period: job.data.period,
        amount: job.data.amount,
        dueDate: job.data.dueDate,
      },
      (processed, total) =>
        this.store.set(
          statusKey,
          JSON.stringify({
            jobId: job.id,
            status: 'processing',
            processed,
            total,
            progressPercent: total > 0 ? Math.floor((processed / total) * 100) : 0,
          }),
          24 * 60 * 60,
        ),
    );

    await this.store.set(
      statusKey,
      JSON.stringify({
        jobId: job.id,
        status: 'completed',
        processed: result.generatedCount,
        total: result.generatedCount,
        progressPercent: 100,
        result,
      }),
      24 * 60 * 60,
    );

    return result;
  }

  private statusKey(societyId: string, jobId: string) {
    return `finance:billgen:${societyId}:${jobId}`;
  }
}
