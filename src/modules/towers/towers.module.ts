import { Module } from '@nestjs/common';

import { TowersController } from './towers.controller';
import { TowersService } from './towers.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TowersController],
  providers: [TowersService],
  exports: [TowersService],
})
export class TowersModule {}