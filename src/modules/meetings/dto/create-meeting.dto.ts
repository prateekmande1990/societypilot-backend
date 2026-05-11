import { IsDateString, IsString } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  title!: string;

  @IsString()
  agenda!: string;

  @IsDateString()
  scheduledAt!: string;
}
