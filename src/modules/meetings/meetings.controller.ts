import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { VoteMeetingDto } from './dto/vote-meeting.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  @Roles(Role.CHAIRMAN, Role.SECRETARY, Role.JOINT_SECRETARY, Role.TOWER_CAPTAIN)
  @Permissions('meetings:write')
  create(@Req() req: { user: JwtPayload }, @Body() dto: CreateMeetingDto) {
    return this.meetingsService.create(req.user, dto);
  }

  @Post(':id/vote')
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
  @Permissions('meetings:vote')
  vote(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: VoteMeetingDto,
  ) {
    return this.meetingsService.vote(req.user, id, dto);
  }
}
