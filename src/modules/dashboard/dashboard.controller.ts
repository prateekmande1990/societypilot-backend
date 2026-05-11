import { Controller, Get, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('chairman')
  @Roles(Role.CHAIRMAN)
  @Permissions('dashboard:chairman')
  chairman(@Req() req: { user: JwtPayload }) {
    return this.dashboardService.chairman(req.user);
  }

  @Get('treasurer')
  @Roles(Role.TREASURER, Role.CHAIRMAN)
  @Permissions('dashboard:treasurer')
  treasurer(@Req() req: { user: JwtPayload }) {
    return this.dashboardService.treasurer(req.user);
  }

  @Get('resident')
  @Roles(
    Role.OWNER_RESIDENT,
    Role.OWNER_NONRESIDENT,
    Role.TENANT,
    Role.FAMILY_MEMBER,
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.TREASURER,
  )
  @Permissions('dashboard:resident')
  resident(@Req() req: { user: JwtPayload }) {
    return this.dashboardService.resident(req.user);
  }
}
