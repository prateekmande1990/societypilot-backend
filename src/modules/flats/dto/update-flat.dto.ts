import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateFlatDto {
  @IsOptional()
  @IsString()
  flatNumber?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  floor?: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  areaSqFt?: number;

  @IsOptional()
  @IsString()
  occupancyStatus?: string;

  @IsOptional()
  isActive?: boolean;
}