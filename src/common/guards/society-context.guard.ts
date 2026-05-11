import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtPayload } from '../../modules/auth/types/jwt-payload.type';

@Injectable()
export class SocietyContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: JwtPayload;
      params?: Record<string, string>;
      body?: Record<string, string>;
    }>();
    if (!request.user) return false;
    const resourceSocietyId =
      request.params?.societyId ?? request.body?.societyId ?? request.user.societyId;
    return resourceSocietyId === request.user.societyId;
  }
}
