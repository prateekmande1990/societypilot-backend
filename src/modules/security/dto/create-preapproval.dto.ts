import { IsDateString, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePreApprovalDto {
  @ApiProperty({ example: 'Sita Bai' })
  @IsString()
  visitorName!: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^[6-9]\d{9}$/)
  visitorPhone?: string;

  @ApiPropertyOptional({ example: 'Maid' })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({ example: '2026-05-31T23:59:59.000Z' })
  @IsDateString()
  validUntil!: string;
}
