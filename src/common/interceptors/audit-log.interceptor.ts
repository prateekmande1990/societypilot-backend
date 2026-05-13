import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AuditLogService } from '../services/audit-log.service';

type ReqUser = {
  userId?: string;
  role?: string;
  societyId?: string;
};

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const req = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      ip?: string;
      params?: Record<string, string>;
      user?: ReqUser;
    }>();

    const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
    if (!writeMethods.has(req.method)) {
      return next.handle();
    }

    const user = req.user;
    const societyId = user?.societyId ?? 'unknown';
    const userId = user?.userId ?? 'anonymous';
    const role = user?.role ?? 'UNKNOWN';
    const resource = this.resourceFromPath(req.url);
    const action = `${req.method} ${resource}`;
    const recordId = req.params?.id ?? null;
    const baseRecord = {
      id: randomUUID(),
      societyId,
      userId,
      role,
      action,
      resource,
      recordId,
      path: req.url,
      method: req.method,
      ip: req.ip ?? 'unknown-ip',
      timestamp: new Date().toISOString(),
    };

    return next.handle().pipe(
      tap(() => {
        void this.auditLogService.write({ ...baseRecord, success: true });
      }),
      catchError((error: unknown) => {
        void this.auditLogService.write({ ...baseRecord, success: false });
        return throwError(() => error);
      }),
    );
  }

  private resourceFromPath(path: string) {
    const clean = path.startsWith('/') ? path.slice(1) : path;
    const parts = clean.split('/');
    if (parts[0] === 'v1') return parts[1] ?? 'unknown';
    return parts[0] ?? 'unknown';
  }
}
