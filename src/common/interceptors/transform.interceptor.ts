import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, { success: true; data: unknown; meta?: unknown }>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ success: true; data: unknown; meta?: unknown }> {
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'items' in (data as Record<string, unknown>) &&
          'pagination' in (data as Record<string, unknown>)
        ) {
          const typed = data as {
            items: unknown;
            pagination: { page: number; limit: number; total: number };
          };
          return {
            success: true as const,
            data: typed.items,
            meta: typed.pagination,
          };
        }

        return {
          success: true as const,
          data,
        };
      }),
    );
  }
}
