import { IsOptional, IsString } from 'class-validator';

export class ReportParkingViolationDto {
  @IsOptional()
  @IsString()
  slotNumber?: string;

  @IsOptional()
  @IsString()
  vehicleNo?: string;

  @IsString()
  description!: string;
}
