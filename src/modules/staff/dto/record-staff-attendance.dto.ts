import { IsIn, IsOptional, IsString } from 'class-validator';

export class RecordStaffAttendanceDto {
  @IsString()
  staffName!: string;

  @IsString()
  role!: string;

  @IsString()
  @IsIn(['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'])
  status!: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';

  @IsOptional()
  @IsString()
  notes?: string;
}
