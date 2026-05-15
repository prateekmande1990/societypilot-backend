import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { JwtPayload } from '../auth/types/jwt-payload.type';

import { CreateMeetingDto } from './dto/create-meeting.dto';
import { CreateResolutionDto } from './dto/create-resolution.dto';
import { VoteDto } from './dto/vote.dto';
import { AttendanceDto } from './dto/attendance.dto';
import { UpdateMeetingStatusDto } from './dto/update-meeting-status.dto';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createMeeting(
    user: JwtPayload,
    dto: CreateMeetingDto,
  ) {
    return this.prisma.meeting.create({
      data: {
        societyId: user.societyId,

        createdById: user.userId,

        title: dto.title,

        description: dto.description,

        meetingType: dto.meetingType,

        scheduledAt: new Date(
          dto.scheduledAt,
        ),

        location: dto.location,

        meetingLink: dto.meetingLink,

        agenda: dto.agenda as any,

        isVotingEnabled:
          dto.isVotingEnabled ?? false,

        isAnonymousVoting:
          dto.isAnonymousVoting ?? false,

        allowProxyVotes:
          dto.allowProxyVotes ?? false,

        votingStartsAt:
          dto.votingStartsAt
            ? new Date(
                dto.votingStartsAt,
              )
            : null,

        votingEndsAt:
          dto.votingEndsAt
            ? new Date(
                dto.votingEndsAt,
              )
            : null,

        quorumPercentage:
          dto.quorumPercentage ?? 51,

        attachmentUrls:
          dto.attachmentUrls ?? [],
      },

      include: {
        createdBy: true,
      },
    });
  }

  async listMeetings(
    societyId: string,
  ) {
    return this.prisma.meeting.findMany({
      where: {
        societyId,
      },

      include: {
        createdBy: true,

        resolutions: true,

        attendances: true,
      },

      orderBy: {
        scheduledAt: 'desc',
      },
    });
  }

  async createResolution(
    societyId: string,
    meetingId: string,
    dto: CreateResolutionDto,
  ) {
    const meeting =
      await this.prisma.meeting.findUnique({
        where: {
          id: meetingId,
        },
      });

    if (!meeting) {
      throw new NotFoundException(
        'Meeting not found',
      );
    }

    return this.prisma.meetingResolution.create(
      {
        data: {
          societyId,

          meetingId,

          title: dto.title,

          description:
            dto.description,

          resolutionType:
            dto.resolutionType,

          votingMethod:
            dto.votingMethod ??
            'SIMPLE_MAJORITY',
        },
      },
    );
  }

  async vote(
    user: JwtPayload,
    meetingId: string,
    resolutionId: string,
    dto: VoteDto,
  ) {
    return this.prisma.meetingVote.upsert({
      where: {
        meetingId_userId_resolutionId:
          {
            meetingId,

            userId: user.userId,

            resolutionId,
          },
      },

      create: {
        societyId: user.societyId,

        meetingId,

        userId: user.userId,

        flatId: user.flatId,

        resolutionId,

        vote: dto.vote,

        remarks: dto.remarks,
      },

      update: {
        vote: dto.vote,

        remarks: dto.remarks,
      },
    });
  }

  async markAttendance(
    user: JwtPayload,
    meetingId: string,
    dto: AttendanceDto,
  ) {
    return this.prisma.meetingAttendance.upsert(
      {
        where: {
          meetingId_userId: {
            meetingId,

            userId: user.userId,
          },
        },

        create: {
          societyId: user.societyId,

          meetingId,

          userId: user.userId,

          flatId: user.flatId,

          attendanceStatus:
            dto.attendanceStatus,

          checkInAt: new Date(),

          remarks: dto.remarks,
        },

        update: {
          attendanceStatus:
            dto.attendanceStatus,

          remarks: dto.remarks,
        },
      },
    );
  }

  async updateMeetingStatus(
    meetingId: string,
    dto: UpdateMeetingStatusDto,
  ) {
    return this.prisma.meeting.update({
      where: {
        id: meetingId,
      },

      data: {
        status: dto.status,

        startedAt:
          dto.status === 'LIVE'
            ? new Date()
            : undefined,

        endedAt:
          dto.status ===
          'COMPLETED'
            ? new Date()
            : undefined,
      },
    });
  }
}