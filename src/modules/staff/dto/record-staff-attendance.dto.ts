import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordStaffAttendanceDto {
  @ApiProperty({ example: 'Rakesh Yadav' })
  @IsString()
  staffName!: string;

  @ApiProperty({ example: 'SECURITY_GUARD' })
  @IsString()
  role!: string;

  @ApiProperty({
    enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'],
    example: 'PRESENT',
  })
  @IsString()
  @IsIn(['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'])
  status!: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';

  @ApiPropertyOptional({ example: 'Reported on-time at main gate' })
  @IsOptional()
  @IsString()
  notes?: string;
}
