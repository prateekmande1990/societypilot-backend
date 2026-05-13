import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignParkingSlotDto {
  @ApiProperty({ example: 'A-12' })
  @IsString()
  slotNumber!: string;

  @ApiProperty({ example: 'flat-uuid-101' })
  @IsString()
  flatId!: string;

  @ApiPropertyOptional({ example: 'user-uuid-101' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ example: 'B1' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: 'CAR' })
  @IsOptional()
  @IsString()
  vehicleType?: string;
}
