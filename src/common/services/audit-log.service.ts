import { Injectable } from '@nestjs/common';
import { RuntimeStoreService } from './runtime-store.service';

export type AuditLogRecord = {
  id: string;
  societyId: string;
  userId: string;
  role: string;
  action: string;
  resource: string;
  recordId: string | null;
  path: string;
  method: string;
  ip: string;
  success: boolean;
  timestamp: string;
};

@Injectable()
export class AuditLogService {
  constructor(private readonly store: RuntimeStoreService) {}

  async write(record: AuditLogRecord) {
    const payload = JSON.stringify(record);
    const ttlSeconds = 90 * 24 * 60 * 60;
    await this.store.lpush(this.key(record.societyId), payload, ttlSeconds);
    await this.store.lpush(this.globalKey(), payload, ttlSeconds);
  }

  async listBySociety(societyId: string, limit = 100) {
    const rows = await this.store.lrange(this.key(societyId), 0, Math.max(limit - 1, 0));
    return rows.map((row) => JSON.parse(row) as AuditLogRecord);
  }

  private key(societyId: string) {
    return `audit:society:${societyId}`;
  }

  private globalKey() {
    return 'audit:global';
  }
}
