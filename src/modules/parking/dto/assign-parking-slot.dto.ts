import { IsOptional, IsString } from 'class-validator';

export class AssignParkingSlotDto {
  @IsString()
  slotNumber!: string;

  @IsString()
  flatId!: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;
}
