import { Body, Controller, Post, Req } from '@nestjs/common';
import { StaffService } from './staff.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Role } from '../../common/enums/role.enum';
import { RecordStaffAttendanceDto } from './dto/record-staff-attendance.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('attendance')
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.JOINT_SECRETARY,
    Role.FACILITY_MANAGER,
    Role.SECURITY_SUPERVISOR,
  )
  @Permissions('staff:attendance')
  recordAttendance(
    @Req() req: { user: JwtPayload },
    @Body() dto: RecordStaffAttendanceDto,
  ) {
    return this.staffService.recordAttendance(req.user, dto);
  }
}
