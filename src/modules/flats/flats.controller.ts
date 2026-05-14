import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { FlatsService } from './flats.service';

import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

import { CreateFlatDto } from './dto/create-flat.dto';
import { UpdateFlatDto } from './dto/update-flat.dto';

@Controller('flats')
export class FlatsController {
  constructor(
    private readonly flatsService: FlatsService,
  ) {}

  @Post(':societyId')
  @Roles(
    Role.SUPER_ADMIN,
    Role.CHAIRMAN,
    Role.SECRETARY,
  )
  createFlat(
    @Param('societyId') societyId: string,
    @Body() dto: CreateFlatDto,
  ) {
    return this.flatsService.createFlat(
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
  listFlats(
    @Param('societyId') societyId: string,
  ) {
    return this.flatsService.listFlats(
      societyId,
    );
  }

  @Get(':societyId/stats')
  @Roles(
    Role.SUPER_ADMIN,
    Role.CHAIRMAN,
    Role.SECRETARY,
  )
  flatStats(
    @Param('societyId') societyId: string,
  ) {
    return this.flatsService.flatStats(
      societyId,
    );
  }

  @Patch(':flatId')
  @Roles(
    Role.SUPER_ADMIN,
    Role.CHAIRMAN,
    Role.SECRETARY,
  )
  updateFlat(
    @Param('flatId') flatId: string,
    @Body() dto: UpdateFlatDto,
  ) {
    return this.flatsService.updateFlat(
      flatId,
      dto,
    );
  }

  @Delete(':flatId')
  @Roles(
    Role.SUPER_ADMIN,
    Role.CHAIRMAN,
  )
  deleteFlat(
    @Param('flatId') flatId: string,
  ) {
    return this.flatsService.deleteFlat(
      flatId,
    );
  }
}