import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import { Role } from '../../../common/enums/role.enum';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateResidentDto {
  @ApiPropertyOptional({
    example: 'Rahul Sharma',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '9876543210',
  })
  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/^[6-9]\d{9}$/)
  phone?: string;

  @ApiPropertyOptional({
    example: 'rahul@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.TENANT,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({
    example: 'MALE',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    example: '1995-08-12',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    example:
      'https://cdn.example.com/profile.jpg',
  })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  isActive?: boolean;
}