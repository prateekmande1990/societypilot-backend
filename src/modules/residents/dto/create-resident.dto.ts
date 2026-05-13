import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResidentDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Length(10, 10)
  @Matches(/^[6-9]\d{9}$/)
  phone!: string;

  @ApiPropertyOptional({ example: 'rahul.sharma@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ enum: Role, example: Role.OWNER_RESIDENT })
  @IsEnum(Role)
  role!: Role;

  @ApiProperty({ example: 'society-uuid-123' })
  @IsString()
  societyId!: string;

  @ApiPropertyOptional({ example: 'flat-uuid-101' })
  @IsOptional()
  @IsString()
  flatId?: string;

  @ApiPropertyOptional({ example: 'tower-a' })
  @IsOptional()
  @IsString()
  towerId?: string;
}
