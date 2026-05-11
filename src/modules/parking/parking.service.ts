import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AssignParkingSlotDto } from './dto/assign-parking-slot.dto';
import { ReportParkingViolationDto } from './dto/report-parking-violation.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class ParkingService {
  constructor(private readonly prisma: PrismaService) {}

  async assignSlot(societyId: string, dto: AssignParkingSlotDto) {
    return this.prisma.parkingSlot.upsert({
      where: { societyId_slotNumber: { societyId, slotNumber: dto.slotNumber } },
      create: {
        societyId,
        slotNumber: dto.slotNumber,
        flatId: dto.flatId,
        userId: dto.userId,
        level: dto.level,
        vehicleType: dto.vehicleType,
      },
      update: {
        flatId: dto.flatId,
        userId: dto.userId,
        level: dto.level,
        vehicleType: dto.vehicleType,
        isActive: true,
      },
    });
  }

  async reportViolation(user: JwtPayload, dto: ReportParkingViolationDto) {
    return this.prisma.parkingViolation.create({
      data: {
        societyId: user.societyId,
        reportedById: user.userId,
        slotNumber: dto.slotNumber,
        vehicleNo: dto.vehicleNo,
        description: dto.description,
      },
    });
  }
}
