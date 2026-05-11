import { IsEnum, IsString } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class AssignUserRoleDto {
  @IsString()
  userId!: string;

  @IsEnum(Role)
  role!: Role;
}
