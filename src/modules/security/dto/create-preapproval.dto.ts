import { IsDateString, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreatePreApprovalDto {
  @IsString()
  visitorName!: string;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^[6-9]\d{9}$/)
  visitorPhone?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsDateString()
  validUntil!: string;
}
