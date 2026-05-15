import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum MeetingTypeDto {
  AGM = 'AGM',
  SGM = 'SGM',
  COMMITTEE = 'COMMITTEE',
  EMERGENCY = 'EMERGENCY',
  TOWER = 'TOWER',
  GENERAL = 'GENERAL',
}

export class CreateMeetingDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(MeetingTypeDto)
  meetingType!: MeetingTypeDto;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  agenda?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isVotingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isAnonymousVoting?: boolean;

  @IsOptional()
  @IsBoolean()
  allowProxyVotes?: boolean;

  @IsOptional()
  @IsDateString()
  votingStartsAt?: string;

  @IsOptional()
  @IsDateString()
  votingEndsAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quorumPercentage?: number;

  @IsOptional()
  @IsArray()
  attachmentUrls?: string[];
}