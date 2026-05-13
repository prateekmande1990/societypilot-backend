import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlatformAdminLoginDto {
  @ApiProperty({ example: 'admin@societypilot.in' })
  @IsString()
  email!: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  password!: string;

  @ApiProperty({ example: '000000' })
  @IsString()
  totp!: string;
}
