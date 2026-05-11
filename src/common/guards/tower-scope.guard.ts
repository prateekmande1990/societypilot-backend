import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { JwtPayload } from '../../modules/auth/types/jwt-payload.type';

@Injectable()
export class TowerScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
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
