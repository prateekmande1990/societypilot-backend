import { IsIn, IsString } from 'class-validator';

export class VoteMeetingDto {
  @IsString()
  @IsIn(['YES', 'NO', 'ABSTAIN'])
  vote!: 'YES' | 'NO' | 'ABSTAIN';
}
