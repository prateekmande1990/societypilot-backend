import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateComplaintDto {
  @ApiProperty({ example: 'Lift not working in Tower A' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Lift has been stuck on floor 5 since morning.' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'LIFT' })
  @IsString()
  category!: string;

  @ApiPropertyOptional({ example: 'flat-uuid-101' })
  @IsOptional()
  @IsString()
  flatId?: string;

  @ApiPropertyOptional({
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'HIGH',
  })
  @IsOptional()
  @IsString()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
