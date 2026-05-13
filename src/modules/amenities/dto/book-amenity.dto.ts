import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BookAmenityDto {
  @ApiProperty({ example: '2026-05-20T10:00:00.000Z' })
  @IsDateString()
  startsAt!: string;

  @ApiProperty({ example: '2026-05-20T12:00:00.000Z' })
  @IsDateString()
  endsAt!: string;
}
