import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGlobalGuard } from './common/guards/jwt-auth-global.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { SocietyContextGuard } from './common/guards/society-context.guard';
import { TowerScopeGuard } from './common/guards/tower-scope.guard';
import { ResidentsModule } from './modules/residents/residents.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { SecurityModule } from './modules/security/security.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AmenitiesModule } from './modules/amenities/amenities.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { ParkingModule } from './modules/parking/parking.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { StaffModule } from './modules/staff/staff.module';
import { AdminSettingsModule } from './modules/admin-settings/admin-settings.module';
import { PlatformAdminModule } from './modules/platform-admin/platform-admin.module';
import { CommonModule } from './common/common.module';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { BullModule } from '@nestjs/bullmq';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TowersModule } from './modules/towers/towers.module';
import { FlatsModule } from './modules/flats/flats.module';
import { VisitorsModule } from './modules/visitors/visitors.module';

const useRedis = Boolean(process.env.REDIS_URL);

@Module({
  controllers: [AppController],
  imports: [
    CommonModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ...(useRedis
      ? [
          BullModule.forRoot({
            connection: {
              url: process.env.REDIS_URL,
            },
          }),
        ]
      : []),
    PrismaModule,
    AuthModule,
    ResidentsModule,
    FinanceModule,
    ComplaintsModule,
    MeetingsModule,
    SecurityModule,
    DocumentsModule,
    DashboardModule,
    AmenitiesModule,
    WebhookModule,
    ParkingModule,
    VendorsModule,
    StaffModule,
    AdminSettingsModule,
    PlatformAdminModule,
    TowersModule,
    FlatsModule,
    VisitorsModule
  ],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
    { provide: APP_GUARD, useClass: RateLimitGuard },
    { provide: APP_GUARD, useClass: JwtAuthGlobalGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: SocietyContextGuard },
    { provide: APP_GUARD, useClass: TowerScopeGuard },
  ],
})
export class AppModule {}
