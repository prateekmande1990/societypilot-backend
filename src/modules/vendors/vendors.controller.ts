import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.TREASURER,
    Role.JOINT_SECRETARY,
    Role.COMMITTEE_MEMBER,
    Role.TOWER_CAPTAIN,
    Role.OWNER_RESIDENT,
    Role.OWNER_NONRESIDENT,
    Role.TENANT,
    Role.FAMILY_MEMBER,
  )
  @Permissions('vendors:read')
  list(
    @Req() req: { user: JwtPayload },
    @Query() query: PaginationQueryDto,
  ) {
    return this.vendorsService.list(req.user.societyId, query);
  }

  @Post()
  @Roles(Role.CHAIRMAN, Role.SECRETARY, Role.JOINT_SECRETARY)
  @Permissions('vendors:write')
  create(@Req() req: { user: JwtPayload }, @Body() dto: CreateVendorDto) {
    return this.vendorsService.create(req.user.societyId, dto);
  }
}
