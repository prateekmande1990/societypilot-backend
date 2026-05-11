import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { VoteMeetingDto } from './dto/vote-meeting.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: JwtPayload, dto: CreateMeetingDto) {
    return this.prisma.meeting.create({
      data: {
        societyId: user.societyId,
        createdById: user.userId,
        title: dto.title,
        agenda: dto.agenda,
        scheduledAt: new Date(dto.scheduledAt),
      },
    });
  }

  async vote(user: JwtPayload, meetingId: string, dto: VoteMeetingDto) {
    const meeting = await this.prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    return this.prisma.meetingVote.upsert({
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
        vote: dto.vote,
      },
      update: {
        vote: dto.vote,
      },
    });
  }
}
