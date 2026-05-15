import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export enum VoteOptionDto {
  YES = 'YES',
  NO = 'NO',
  ABSTAIN = 'ABSTAIN',
}

export class VoteDto {
  @IsEnum(VoteOptionDto)
  vote!: VoteOptionDto;

  @IsOptional()
  @IsString()
  remarks?: string;
}