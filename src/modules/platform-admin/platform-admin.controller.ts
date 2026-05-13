import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { PlatformAdminService } from './platform-admin.service';
import { PlatformAdminLoginDto } from './dto/platform-admin-login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateSocietyDto } from './dto/create-society.dto';
import { UpdateSocietyDto } from './dto/update-society.dto';

@Controller('platform-admin')
export class PlatformAdminController {
  constructor(
    private readonly platformAdminService: PlatformAdminService,
  ) {}

  @Public()
  @Post('auth/login')
  login(@Body() dto: PlatformAdminLoginDto) {
    return this.platformAdminService.login(dto);
  }

  @Get('societies')
  @Roles(Role.SUPER_ADMIN)
  listSocieties(
    @Query('search') search?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.platformAdminService.listSocieties({
      search,
      city,
      state,
      page: Number(page ?? 1),
      limit: Number(limit ?? 10),
    });
  }

  @Post('societies')
  @Roles(Role.SUPER_ADMIN)
  createSociety(@Body() dto: CreateSocietyDto) {
    return this.platformAdminService.createSociety(dto);
  }

  @Get('societies/:id')
  @Roles(Role.SUPER_ADMIN)
  societyDetail(@Param('id') id: string) {
    return this.platformAdminService.societyDetail(id);
  }

  @Patch('societies/:id')
  @Roles(Role.SUPER_ADMIN)
  updateSociety(
    @Param('id') id: string,
    @Body() dto: UpdateSocietyDto,
  ) {
    return this.platformAdminService.updateSociety(id, dto);
  }

  @Patch('societies/:id/status')
  @Roles(Role.SUPER_ADMIN)
  updateSocietyStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.platformAdminService.updateSocietyStatus(
      id,
      status,
    );
  }

  @Get('societies/:id/users')
  @Roles(Role.SUPER_ADMIN)
  societyUsers(@Param('id') id: string) {
    return this.platformAdminService.societyUsers(id);
  }

  @Get('societies/:id/onboarding')
  @Roles(Role.SUPER_ADMIN)
  onboardingStatus(@Param('id') id: string) {
    return this.platformAdminService.onboardingStatus(id);
  }

  @Patch('societies/:id/onboarding/towers')
  @Roles(Role.SUPER_ADMIN)
  completeTowers(@Param('id') id: string) {
    return this.platformAdminService.completeTowers(id);
  }

  @Patch('societies/:id/onboarding/flats')
  @Roles(Role.SUPER_ADMIN)
  completeFlats(@Param('id') id: string) {
    return this.platformAdminService.completeFlats(id);
  }

  @Patch('societies/:id/onboarding/maintenance')
  @Roles(Role.SUPER_ADMIN)
  completeMaintenance(@Param('id') id: string) {
    return this.platformAdminService.completeMaintenance(id);
  }

  @Patch('societies/:id/onboarding/payment-gateway')
  @Roles(Role.SUPER_ADMIN)
  completePaymentGateway(@Param('id') id: string) {
    return this.platformAdminService.completePaymentGateway(
      id,
    );
  }

  @Post('societies/:id/impersonate')
  @Roles(Role.SUPER_ADMIN)
  impersonate(@Param('id') id: string) {
    return this.platformAdminService.impersonate(id);
  }
}