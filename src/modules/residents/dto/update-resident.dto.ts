import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResidentDto {
  @ApiPropertyOptional({ example: 'Rahul Sharma' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^[6-9]\d{9}$/)
  phone?: string;

  @ApiPropertyOptional({ example: 'rahul.sharma@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ enum: Role, example: Role.TENANT })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: 'flat-uuid-102' })
  @IsOptional()
  @IsString()
  flatId?: string;

  @ApiPropertyOptional({ example: 'tower-b' })
  @IsOptional()
  @IsString()
  towerId?: string;
}
