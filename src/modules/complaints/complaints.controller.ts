import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.TREASURER,
    Role.JOINT_SECRETARY,
    Role.COMMITTEE_MEMBER,
    Role.TOWER_CAPTAIN,
    Role.OWNER_RESIDENT,
    Role.OWNER_NONRESIDENT,
    Role.TENANT,
    Role.FAMILY_MEMBER,
  )
  @Permissions('complaints:write')
  raise(@Req() req: { user: JwtPayload }, @Body() dto: CreateComplaintDto) {
    return this.complaintsService.raise(req.user, dto);
  }

  @Get()
  list(@Req() req: { user: JwtPayload }, @Query() query: PaginationQueryDto) {
    return this.complaintsService.list(req.user, query);
  }

  @Patch(':id/status')
  @Roles(Role.CHAIRMAN, Role.SECRETARY, Role.JOINT_SECRETARY, Role.MAINTENANCE_STAFF)
  @Permissions('complaints:update')
  updateStatus(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: UpdateComplaintStatusDto,
  ) {
    return this.complaintsService.updateStatus(req.user, id, dto);
  }

  @Post(':id/escalate')
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.JOINT_SECRETARY,
    Role.COMMITTEE_MEMBER,
    Role.TOWER_CAPTAIN,
    Role.OWNER_RESIDENT,
    Role.OWNER_NONRESIDENT,
    Role.TENANT,
  )
  @Permissions('complaints:write')
  escalate(@Param('id') id: string) {
    return this.complaintsService.escalate(id);
  }

  @Post('escalations/run')
  @Roles(Role.CHAIRMAN, Role.SECRETARY, Role.SUPER_ADMIN)
  @Permissions('complaints:update')
  runEscalations(@Req() req: { user: JwtPayload }) {
    const scope =
      req.user.role === Role.SUPER_ADMIN ? undefined : req.user.societyId;
    return this.complaintsService.runAutoEscalation(scope);
  }
}
