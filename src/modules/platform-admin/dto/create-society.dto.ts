import { IsOptional, IsString } from 'class-validator';

export class CreateSocietyDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsOptional()
  @IsString()
  pincode?: string;
}
