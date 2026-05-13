import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSocietyDto {
  @ApiProperty({ example: 'Green Valley CHS' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'green-valley-chs' })
  @IsString()
  slug!: string;

  @ApiPropertyOptional({ example: 'Baner Road, Pune' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Pune' })
  @IsString()
  city!: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  state!: string;

  @ApiPropertyOptional({ example: '411045' })
  @IsOptional()
  @IsString()
  pincode?: string;
}
