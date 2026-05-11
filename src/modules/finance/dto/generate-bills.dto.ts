import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class GenerateBillsDto {
  @IsString()
  period!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
