import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecordPaymentDto {
  @ApiProperty({ example: 'user-uuid-101' })
  @IsString()
  userId!: string;

  @ApiPropertyOptional({ example: 'bill-uuid-101' })
  @IsOptional()
  @IsString()
  billId?: string;

  @ApiProperty({ example: 2500 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ enum: ['CASH', 'BANK_TRANSFER', 'UPI', 'CARD'], example: 'UPI' })
  @IsString()
  @IsIn(['CASH', 'BANK_TRANSFER', 'UPI', 'CARD'])
  method!: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CARD';
}
