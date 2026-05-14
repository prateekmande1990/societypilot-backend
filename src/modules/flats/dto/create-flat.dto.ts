import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateFlatDto {
  @IsString()
  towerId!: string;

  @IsString()
  flatNumber!: string;

  @IsNumber()
  @Min(0)
  floor!: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsNumber()
  areaSqFt?: number;

  @IsOptional()
  @IsString()
  occupancyStatus?: string;
}