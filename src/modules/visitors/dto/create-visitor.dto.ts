import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateVisitorDto {
  @ApiProperty({
    example: 'Rahul Sharma',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    example: '9876543210',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    enum: [
      'GUEST',
      'DELIVERY',
      'CAB',
      'SERVICE',
      'STAFF',
      'EMERGENCY',
    ],
    example: 'GUEST',
  })
  @IsString()
  @IsEnum([
    'GUEST',
    'DELIVERY',
    'CAB',
    'SERVICE',
    'STAFF',
    'EMERGENCY',
  ])
  visitorType!:
    | 'GUEST'
    | 'DELIVERY'
    | 'CAB'
    | 'SERVICE'
    | 'STAFF'
    | 'EMERGENCY';

  @ApiPropertyOptional({
    example:
      'Visiting resident',
  })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({
    example: 'MH12AB1234',
  })
  @IsOptional()
  @IsString()
  vehicleNo?: string;

  @ApiPropertyOptional({
    example: 'Amazon',
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({
    example: 'Main Gate',
  })
  @IsOptional()
  @IsString()
  entryGate?: string;

  @ApiPropertyOptional({
    example:
      'Resident approved by call',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}