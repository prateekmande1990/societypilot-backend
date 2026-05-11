import { IsDateString } from 'class-validator';

export class BookAmenityDto {
  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;
}
