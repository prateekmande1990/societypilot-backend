import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class CreateResidentDto {
  @IsString()
  name!: string;

  @IsString()
  @Length(10, 10)
  @Matches(/^[6-9]\d{9}$/)
  phone!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsEnum(Role)
  role!: Role;

  @IsString()
  societyId!: string;

  @IsOptional()
  @IsString()
  flatId?: string;

  @IsOptional()
  @IsString()
  towerId?: string;
}
