import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { JwtPayload } from '../../modules/auth/types/jwt-payload.type';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class SocietyContextGuard
  implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const isPublic =
      this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (isPublic) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest<{
        user?: JwtPayload;
        params?: Record<string, string>;
        body?: Record<string, string>;
      }>();

    if (!request.user) {
      return false;
    }

    /*
     * SUPER_ADMIN bypasses
     * society isolation checks
     */
    if (
      request.user.role ===
      Role.SUPER_ADMIN
    ) {
      return true;
    }

    const resourceSocietyId =
      request.params?.societyId ??
      request.body?.societyId ??
      request.user.societyId;

    return (
      resourceSocietyId ===
      request.user.societyId
    );
  }
}