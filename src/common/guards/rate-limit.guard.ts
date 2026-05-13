import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RuntimeStoreService } from '../services/runtime-store.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly store: RuntimeStoreService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      ip?: string;
      headers?: Record<string, string>;
    }>();

    const authHeader =
      request?.headers?.authorization ?? request?.headers?.Authorization;
    const isAuthenticated = Boolean(authHeader);
    const limit = isAuthenticated ? 1000 : 100;
    const bucket = Math.floor(Date.now() / 60000);
    const ip = request.ip ?? 'unknown-ip';
    const key = `ratelimit:${bucket}:${ip}:${isAuthenticated ? 'auth' : 'public'}`;

    const count = await this.store.incr(key);
    if (count === 1) {
      await this.store.expire(key, 60);
    }

    if (count > limit) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
