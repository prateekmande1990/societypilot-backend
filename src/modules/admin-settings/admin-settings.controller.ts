import { Body, Controller, Get, Patch, Post, Query, Req } from '@nestjs/common';
import { AdminSettingsService } from './admin-settings.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UpdateSocietyProfileDto } from './dto/update-society-profile.dto';
import { AssignUserRoleDto } from './dto/assign-user-role.dto';

@Controller('settings')
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  @Patch('society-profile')
  @Roles(Role.CHAIRMAN)
  @Permissions('settings:society')
  updateSocietyProfile(
    @Req() req: { user: JwtPayload },
    @Body() dto: UpdateSocietyProfileDto,
  ) {
    return this.adminSettingsService.updateSocietyProfile(req.user, dto);
  }

  @Post('users/assign-role')
  @Roles(Role.CHAIRMAN, Role.SECRETARY)
  @Permissions('settings:roles')
  assignUserRole(@Req() req: { user: JwtPayload }, @Body() dto: AssignUserRoleDto) {
    return this.adminSettingsService.assignUserRole(req.user, dto);
  }

  @Get('audit-logs')
  @Roles(Role.CHAIRMAN, Role.SECRETARY)
  @Permissions('settings:roles')
  auditLogs(
    @Req() req: { user: JwtPayload },
    @Query('limit') limit?: string,
  ) {
    return this.adminSettingsService.listAuditLogs(
      req.user,
      limit ? Number(limit) : undefined,
    );
  }
}
