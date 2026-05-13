import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({ example: 'Sai Electricals' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'ELECTRICAL' })
  @IsString()
  category!: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'support@saielectricals.in' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'Handles lift and common-area maintenance' })
  @IsOptional()
  @IsString()
  notes?: string;
}
