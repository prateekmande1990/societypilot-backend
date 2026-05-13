import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateComplaintStatusDto {
  @ApiProperty({
    enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS', 'RESOLVED', 'CLOSED'],
    example: 'IN_PROGRESS',
  })
  @IsString()
  @IsIn(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS', 'RESOLVED', 'CLOSED'])
  status!: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_PARTS' | 'RESOLVED' | 'CLOSED';
}
