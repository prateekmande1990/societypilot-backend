import { IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMeetingDto {
  @ApiProperty({ example: 'Monthly Committee Meeting' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Discuss maintenance budget and pending complaints.' })
  @IsString()
  agenda!: string;

  @ApiProperty({ example: '2026-05-20T11:00:00.000Z' })
  @IsDateString()
  scheduledAt!: string;
}
