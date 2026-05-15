import {
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export enum ResolutionTypeDto {
  FINANCIAL = 'FINANCIAL',
  ELECTION = 'ELECTION',
  BYLAW = 'BYLAW',
  MAINTENANCE = 'MAINTENANCE',
  EMERGENCY = 'EMERGENCY',
  SECURITY="SECURITY",
  OTHER = 'OTHER',
}

export enum VotingMethodDto {
  SIMPLE_MAJORITY = 'SIMPLE_MAJORITY',
  TWO_THIRDS = 'TWO_THIRDS',
  UNANIMOUS = 'UNANIMOUS',
}

export class CreateResolutionDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ResolutionTypeDto)
  resolutionType!: ResolutionTypeDto;

  @IsOptional()
  @IsEnum(VotingMethodDto)
  votingMethod?: VotingMethodDto;
}