import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PlatformAdminService } from './platform-admin.service';
import { PlatformAdminLoginDto } from './dto/platform-admin-login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateSocietyDto } from './dto/create-society.dto';

@Controller('platform-admin')
export class PlatformAdminController {
  constructor(private readonly platformAdminService: PlatformAdminService) {}

  @Public()
  @Post('auth/login')
  login(@Body() dto: PlatformAdminLoginDto) {
    return this.platformAdminService.login(dto);
  }

  @Get('societies')
  @Roles(Role.SUPER_ADMIN)
  listSocieties() {
    return this.platformAdminService.listSocieties();
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

  @Post('societies/:id/impersonate')
  @Roles(Role.SUPER_ADMIN)
  impersonate(@Param('id') id: string) {
    return this.platformAdminService.impersonate(id);
  }
}
