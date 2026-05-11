import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

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
  list(@Req() req: { user: JwtPayload }) {
    return this.complaintsService.list(req.user);
  }

  @Patch(':id/status')
  @Roles(Role.CHAIRMAN, Role.SECRETARY, Role.JOINT_SECRETARY, Role.MAINTENANCE_STAFF)
  @Permissions('complaints:update')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateComplaintStatusDto) {
    return this.complaintsService.updateStatus(id, dto);
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
}
