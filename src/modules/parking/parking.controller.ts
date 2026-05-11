import { Body, Controller, Post, Req } from '@nestjs/common';
import { ParkingService } from './parking.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Role } from '../../common/enums/role.enum';
import { AssignParkingSlotDto } from './dto/assign-parking-slot.dto';
import { ReportParkingViolationDto } from './dto/report-parking-violation.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Post('slots/assign')
  @Roles(Role.CHAIRMAN, Role.SECRETARY, Role.JOINT_SECRETARY)
  @Permissions('parking:assign')
  assignSlot(
    @Req() req: { user: JwtPayload },
    @Body() dto: AssignParkingSlotDto,
  ) {
    return this.parkingService.assignSlot(req.user.societyId, dto);
  }

  @Post('violations')
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
    Role.SECURITY_GUARD,
    Role.SECURITY_SUPERVISOR,
  )
  @Permissions('parking:violation')
  reportViolation(
    @Req() req: { user: JwtPayload },
    @Body() dto: ReportParkingViolationDto,
  ) {
    return this.parkingService.reportViolation(req.user, dto);
  }
}
