import { Module } from '@nestjs/common';

import { ResidentsController } from './residents.controller';
import { ResidentsService } from './residents.service';

import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ResidentsController],
  providers: [ResidentsService],
  exports: [ResidentsService],
})
export class ResidentsModule {}