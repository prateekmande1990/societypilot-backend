import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { JwtPayload } from '../../modules/auth/types/jwt-payload.type';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TowerScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<{
      user?: JwtPayload;
      body?: Record<string, string>;
      params?: Record<string, string>;
      query?: Record<string, string>;
    }>();
    if (!request.user) return false;
    if (request.user.role !== Role.TOWER_CAPTAIN) return true;
    const towerId =
      request.body?.towerId ?? request.params?.towerId ?? request.query?.towerId;
    if (!towerId) return true;
    return towerId === request.user.towerId;
  }
}
