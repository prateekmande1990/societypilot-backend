import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class UpdateVisitorStatusDto {
  @ApiProperty({
    enum: [
      'APPROVED',
      'DENIED',
      'ENTERED',
      'EXITED',
    ],
    example: 'EXITED',
  })
  @IsString()
  @IsEnum([
    'APPROVED',
    'DENIED',
    'ENTERED',
    'EXITED',
  ])
  status!:
    | 'APPROVED'
    | 'DENIED'
    | 'ENTERED'
    | 'EXITED';

  @ApiPropertyOptional({
    example:
      'Visitor exited successfully',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}