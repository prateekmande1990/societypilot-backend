import {
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateSocietyDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 120)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(2, 60)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(2, 60)
  state?: string;

  @IsOptional()
  @IsString()
  @Length(4, 12)
  pincode?: string;
}