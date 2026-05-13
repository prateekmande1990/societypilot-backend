import { IsEnum, IsString } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class AssignUserRoleDto {
  @ApiProperty({ example: 'user-uuid-101' })
  @IsString()
  userId!: string;

  @ApiProperty({ enum: Role, example: Role.SECRETARY })
  @IsEnum(Role)
  role!: Role;
}
