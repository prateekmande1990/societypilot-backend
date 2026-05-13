import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VoteMeetingDto {
  @ApiProperty({ enum: ['YES', 'NO', 'ABSTAIN'], example: 'YES' })
  @IsString()
  @IsIn(['YES', 'NO', 'ABSTAIN'])
  vote!: 'YES' | 'NO' | 'ABSTAIN';
}
