import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportParkingViolationDto {
  @ApiPropertyOptional({ example: 'A-12' })
  @IsOptional()
  @IsString()
  slotNumber?: string;

  @ApiPropertyOptional({ example: 'MH12AB1234' })
  @IsOptional()
  @IsString()
  vehicleNo?: string;

  @ApiProperty({ example: 'Unauthorized parking in reserved slot.' })
  @IsString()
  description!: string;
}
