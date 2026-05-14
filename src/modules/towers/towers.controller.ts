import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { TowersService } from './towers.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateTowerDto } from './dto/create-tower.dto';
import { UpdateTowerDto } from './dto/update-tower.dto';

@Controller('towers')
export class TowersController {
  constructor(
    private readonly towersService: TowersService,
  ) {}

  @Post(':societyId')
  @Roles(
    Role.SUPER_ADMIN,
    Role.CHAIRMAN,
    Role.SECRETARY,
  )
  createTower(
    @Param('societyId') societyId: string,
    @Body() dto: CreateTowerDto,
  ) {
    return this.towersService.createTower(
      societyId,
      dto,
    );
  }

  @Get(':societyId')
  @Roles(
    Role.SUPER_ADMIN,
    Role.CHAIRMAN,
    Role.SECRETARY,
  )
  listTowers(
    @Param('societyId') societyId: string,
  ) {
    return this.towersService.listTowers(
      societyId,
    );
  }

  @Get(':societyId/stats')
  @Roles(
    Role.SUPER_ADMIN,
    Role.CHAIRMAN,
    Role.SECRETARY,
  )
  towerStats(
    @Param('societyId') societyId: string,
  ) {
    return this.towersService.towerStats(
      societyId,
    );
  }

  @Patch(':towerId')
  @Roles(
    Role.SUPER_ADMIN,
    Role.CHAIRMAN,
    Role.SECRETARY,
  )
  updateTower(
    @Param('towerId') towerId: string,
    @Body() dto: UpdateTowerDto,
  ) {
    return this.towersService.updateTower(
      towerId,
      dto,
    );
  }

  @Delete(':towerId')
  @Roles(
    Role.SUPER_ADMIN,
    Role.CHAIRMAN,
  )
  deleteTower(
    @Param('towerId') towerId: string,
  ) {
    return this.towersService.deleteTower(
      towerId,
    );
  }
}