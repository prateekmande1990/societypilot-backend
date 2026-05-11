import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class RecordPaymentDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  billId?: string;

  @IsNumber()
  amount!: number;

  @IsString()
  @IsIn(['CASH', 'BANK_TRANSFER', 'UPI', 'CARD'])
  method!: 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CARD';
}
