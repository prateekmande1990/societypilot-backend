import { Body, Controller, Post, Req } from '@nestjs/common';
import { SecurityService } from './security.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Role } from '../../common/enums/role.enum';
import { LogVisitorEntryDto } from './dto/log-visitor-entry.dto';
import { CreatePreApprovalDto } from './dto/create-preapproval.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Post('visitors')
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.SECURITY_SUPERVISOR,
    Role.SECURITY_GUARD,
  )
  @Permissions('security:write')
  logVisitorEntry(
    @Req() req: { user: JwtPayload },
    @Body() dto: LogVisitorEntryDto,
  ) {
    return this.securityService.logVisitorEntry(req.user.societyId, dto);
  }

  @Post('preapprovals')
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
  )
  @Permissions('security:preapprove')
  createPreApproval(
    @Req() req: { user: JwtPayload },
    @Body() dto: CreatePreApprovalDto,
  ) {
    return this.securityService.createPreApproval(req.user, dto);
  }
}
