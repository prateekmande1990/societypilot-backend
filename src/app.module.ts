import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGlobalGuard } from './common/guards/jwt-auth-global.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { SocietyContextGuard } from './common/guards/society-context.guard';
import { TowerScopeGuard } from './common/guards/tower-scope.guard';
import { ResidentsModule } from './modules/residents/residents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ResidentsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGlobalGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: SocietyContextGuard },
    { provide: APP_GUARD, useClass: TowerScopeGuard },
  ],
})
export class AppModule {}
