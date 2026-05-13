import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogVisitorEntryDto {
  @ApiProperty({ example: 'Ramesh Delivery' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^[6-9]\d{9}$/)
  phone?: string;

  @ApiPropertyOptional({ example: 'Food delivery' })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({ example: 'MH12AB1234' })
  @IsOptional()
  @IsString()
  vehicleNo?: string;
}
