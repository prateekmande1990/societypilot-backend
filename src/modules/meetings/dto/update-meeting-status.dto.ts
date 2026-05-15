import { IsEnum } from 'class-validator';

export enum MeetingStatusDto {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateMeetingStatusDto {
  @IsEnum(MeetingStatusDto)
  status!: MeetingStatusDto;
}