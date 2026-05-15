import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import { MeetingsService } from './meetings.service';

import { JwtPayload } from '../auth/types/jwt-payload.type';

import { Roles } from '../../common/decorators/roles.decorator';

import { Permissions } from '../../common/decorators/permissions.decorator';

import { Role } from '../../common/enums/role.enum';

import { CreateMeetingDto } from './dto/create-meeting.dto';
import { CreateResolutionDto } from './dto/create-resolution.dto';
import { VoteDto } from './dto/vote.dto';
import { AttendanceDto } from './dto/attendance.dto';
import { UpdateMeetingStatusDto } from './dto/update-meeting-status.dto';

@Controller('meetings')
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
  ) {}

  @Post()
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.JOINT_SECRETARY,
  )
  @Permissions('meetings:write')
  create(
    @Req() req: { user: JwtPayload },

    @Body() dto: CreateMeetingDto,
  ) {
    return this.meetingsService.createMeeting(
      req.user,
      dto,
    );
  }

  @Get()
  @Permissions('meetings:read')
  list(
    @Req() req: { user: JwtPayload },
  ) {
    return this.meetingsService.listMeetings(
      req.user.societyId,
    );
  }

  @Post(':meetingId/resolutions')
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
  )
  @Permissions('meetings:write')
  createResolution(
    @Req() req: { user: JwtPayload },

    @Param('meetingId')
    meetingId: string,

    @Body()
    dto: CreateResolutionDto,
  ) {
    return this.meetingsService.createResolution(
      req.user.societyId,
      meetingId,
      dto,
    );
  }

  @Post(
    ':meetingId/resolutions/:resolutionId/vote',
  )
  @Permissions('meetings:vote')
  vote(
    @Req() req: { user: JwtPayload },

    @Param('meetingId')
    meetingId: string,

    @Param('resolutionId')
    resolutionId: string,

    @Body() dto: VoteDto,
  ) {
    return this.meetingsService.vote(
      req.user,
      meetingId,
      resolutionId,
      dto,
    );
  }

  @Post(':meetingId/attendance')
  @Permissions('meetings:read')
  attendance(
    @Req() req: { user: JwtPayload },

    @Param('meetingId')
    meetingId: string,

    @Body() dto: AttendanceDto,
  ) {
    return this.meetingsService.markAttendance(
      req.user,
      meetingId,
      dto,
    );
  }

  @Patch(':meetingId/status')
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
  )
  @Permissions('meetings:write')
  updateStatus(
    @Param('meetingId')
    meetingId: string,

    @Body()
    dto: UpdateMeetingStatusDto,
  ) {
    return this.meetingsService.updateMeetingStatus(
      meetingId,
      dto,
    );
  }
}