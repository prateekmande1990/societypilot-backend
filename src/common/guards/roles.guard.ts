import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

import { JwtPayload } from '../../modules/auth/types/jwt-payload.type';

import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard
  implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const roles =
      this.reflector.getAllAndOverride<
        string[]
      >(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!roles || roles.length === 0) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest<{
        user?: JwtPayload;
      }>();

    if (!request.user) {
      return false;
    }

    /*
     * SUPER_ADMIN bypass
     */
    if (
      request.user.role ===
      Role.SUPER_ADMIN
    ) {
      return true;
    }

    return roles.includes(
      request.user.role,
    );
  }
}