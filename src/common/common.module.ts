import { Global, Module } from '@nestjs/common';
import { RuntimeStoreService } from './services/runtime-store.service';
import { AuditLogService } from './services/audit-log.service';

@Global()
@Module({
  providers: [RuntimeStoreService, AuditLogService],
  exports: [RuntimeStoreService, AuditLogService],
})
export class CommonModule {}
