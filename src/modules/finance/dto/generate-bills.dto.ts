import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateBillsDto {
  @ApiProperty({ example: '2026-05' })
  @IsString()
  period!: string;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ example: '2026-05-25T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
