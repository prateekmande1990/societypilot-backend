import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class UpdateResidentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^[6-9]\d{9}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  flatId?: string;

  @IsOptional()
  @IsString()
  towerId?: string;
}
