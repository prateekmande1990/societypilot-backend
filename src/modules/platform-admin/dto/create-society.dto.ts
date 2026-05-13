import {
  IsEmail,
  IsMobilePhone,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateSocietyDto {
  @ApiProperty({
    example: 'Mangalam Life Park 2',
  })
  @IsString()
  @Length(3, 120)
  name!: string;

  @ApiPropertyOptional({
    example: 'mangalam-life-park-2',
    description:
      'Optional custom slug. If omitted, backend auto-generates.',
  })
  @IsOptional()
  @IsString()
  @Length(3, 120)
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'Slug can only contain lowercase letters, numbers and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Moshi-Alandi Road Dudulgaon, Pune',
  })
  @IsOptional()
  @IsString()
  @Length(3, 300)
  address?: string;

  @ApiProperty({
    example: 'Pune',
  })
  @IsString()
  @Length(2, 60)
  city!: string;

  @ApiProperty({
    example: 'Maharashtra',
  })
  @IsString()
  @Length(2, 60)
  state!: string;

  @ApiPropertyOptional({
    example: '412105',
  })
  @IsOptional()
  @IsString()
  @Length(4, 12)
  pincode?: string;

  @ApiProperty({
    example: 'Pratik Patil',
    description:
      'Initial chairman full name',
  })
  @IsString()
  @Length(2, 120)
  chairmanName!: string;

  @ApiProperty({
    example: '+919876543210',
    description:
      'Chairman mobile number',
  })
  @IsMobilePhone('en-IN')
  chairmanPhone!: string;

  @ApiProperty({
    example: 'chairman@society.com',
  })
  @IsEmail()
  chairmanEmail!: string;
}