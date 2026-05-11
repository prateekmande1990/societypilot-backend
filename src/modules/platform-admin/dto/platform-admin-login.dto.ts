import { IsString } from 'class-validator';

export class PlatformAdminLoginDto {
  @IsString()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  totp!: string;
}
