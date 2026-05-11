import { IsString, Length, Matches } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @Length(10, 10)
  @Matches(/^[6-9]\d{9}$/, { message: 'Invalid Indian mobile number' })
  phone!: string;
}
