import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';

import { ResidentsService } from './residents.service';

import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';

import { Role } from '../../common/enums/role.enum';

import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller()
export class ResidentsController {
  constructor(
    private readonly residentsService: ResidentsService,
  ) {}

  @Get('residents')
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.TREASURER,
    Role.JOINT_SECRETARY,
    Role.COMMITTEE_MEMBER,
    Role.TOWER_CAPTAIN,
  )
  @Permissions('residents:read')
  list(
    @Req() req: {
      user: {
        societyId: string;
      };
    },
    @Query() query: PaginationQueryDto,
  ) {
    return this.residentsService.list(
      req.user.societyId,
      query,
    );
  }

  @Get('residents/stats')
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.TREASURER,
  )
  @Permissions('residents:read')
  stats(
    @Req() req: {
      user: {
        societyId: string;
      };
    },
  ) {
    return this.residentsService.stats(
      req.user.societyId,
    );
  }

  @Post(
    'societies/:societyId/flats/:flatId/residents',
  )
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.JOINT_SECRETARY,
  )
  @Permissions('residents:write')
  create(
    @Param('societyId') societyId: string,
    @Param('flatId') flatId: string,
    @Body() dto: CreateResidentDto,
  ) {
    return this.residentsService.create(
      societyId,
      flatId,
      dto,
    );
  }

  @Patch(
    'societies/:societyId/flats/:flatId/residents/:residentId',
  )
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.JOINT_SECRETARY,
  )
  @Permissions('residents:write')
  update(
    @Param('societyId') societyId: string,
    @Param('flatId') flatId: string,
    @Param('residentId') residentId: string,
    @Body() dto: UpdateResidentDto,
  ) {
    return this.residentsService.update(
      societyId,
      flatId,
      residentId,
      dto,
    );
  }

  @Get('flats/:flatId/residents')
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.TREASURER,
    Role.JOINT_SECRETARY,
    Role.COMMITTEE_MEMBER,
    Role.TOWER_CAPTAIN,
  )
  @Permissions('residents:read')
  flatResidents(
    @Param('flatId') flatId: string,
  ) {
    return this.residentsService.flatResidents(
      flatId,
    );
  }

  @Post('residents/:residentId/moveout')
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.JOINT_SECRETARY,
  )
  @Permissions('residents:write')
  moveOut(
    @Param('residentId')
    residentId: string,
  ) {
    return this.residentsService.moveOut(
      residentId,
    );
  }
}