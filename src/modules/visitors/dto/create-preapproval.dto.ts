import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreatePreApprovalDto {
  @ApiProperty({
    example: 'Guest Visitor',
  })
  @IsString()
  visitorName!: string;

  @ApiPropertyOptional({
    example: '9876543210',
  })
  @IsOptional()
  @IsString()
  visitorPhone?: string;

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
      'Family visit',
  })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({
    example:
      '2026-05-20T23:59:59.000Z',
  })
  @IsDateString()
  validUntil!: string;

  @ApiPropertyOptional({
    example: 'MH12AB1234',
  })
  @IsOptional()
  @IsString()
  vehicleNo?: string;
}