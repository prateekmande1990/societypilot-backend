import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import { Role } from '../../../common/enums/role.enum';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateResidentDto {
  @ApiProperty({
    example: 'Rahul Sharma',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: '9876543210',
  })
  @IsString()
  @Length(10, 10)
  @Matches(/^[6-9]\d{9}$/)
  phone!: string;

  @ApiPropertyOptional({
    example: 'rahul@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    enum: Role,
    example: Role.OWNER_RESIDENT,
  })
  @IsEnum(Role)
  role!: Role;

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
}