import {
  IsInt,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateTowerDto {
  @IsString()
  @Length(1, 60)
  name!: string;

  @IsInt()
  @Min(1)
  totalFloors!: number;

  @IsInt()
  @Min(1)
  totalFlats!: number;
}