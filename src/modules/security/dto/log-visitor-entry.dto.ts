import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class LogVisitorEntryDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^[6-9]\d{9}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  vehicleNo?: string;
}
