import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class ApproveVisitorDto {
  @ApiProperty({
    enum: [
      'PRE_APPROVED',
      'CALL_APPROVED',
      'OTP_APPROVED',
      'QR_APPROVED',
      'MANUAL',
    ],
    example: 'MANUAL',
  })
  @IsString()
  @IsEnum([
    'PRE_APPROVED',
    'CALL_APPROVED',
    'OTP_APPROVED',
    'QR_APPROVED',
    'MANUAL',
  ])
  approvalMode!:
    | 'PRE_APPROVED'
    | 'CALL_APPROVED'
    | 'OTP_APPROVED'
    | 'QR_APPROVED'
    | 'MANUAL';

  @ApiPropertyOptional({
    example:
      'Approved by resident',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}