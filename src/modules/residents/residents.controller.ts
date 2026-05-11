import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ResidentsService } from './residents.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('residents')
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Get()
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.TREASURER,
    Role.JOINT_SECRETARY,
    Role.COMMITTEE_MEMBER,
    Role.TOWER_CAPTAIN,
  )
  @Permissions('residents:read')
  list(@Req() req: { user: { societyId: string } }) {
    return this.residentsService.list(req.user.societyId);
  }

  @Post()
  @Roles(Role.CHAIRMAN, Role.SECRETARY, Role.JOINT_SECRETARY)
  @Permissions('residents:write')
  create(@Body() dto: CreateResidentDto) {
    return this.residentsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.CHAIRMAN, Role.SECRETARY, Role.JOINT_SECRETARY)
  @Permissions('residents:write')
  update(@Param('id') id: string, @Body() dto: UpdateResidentDto) {
    return this.residentsService.update(id, dto);
  }

  @Post(':id/moveout')
  @Roles(Role.CHAIRMAN, Role.SECRETARY, Role.JOINT_SECRETARY)
  @Permissions('residents:write')
  moveOut(@Param('id') id: string) {
    return this.residentsService.moveOut(id);
  }
}
