import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export enum AttendanceStatusDto {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  PROXY = 'PROXY',
}

export class AttendanceDto {
  @IsEnum(AttendanceStatusDto)
  attendanceStatus!: AttendanceStatusDto;

  @IsOptional()
  @IsString()
  remarks?: string;
}