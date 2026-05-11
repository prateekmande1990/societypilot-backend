import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecordStaffAttendanceDto } from './dto/record-staff-attendance.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async recordAttendance(user: JwtPayload, dto: RecordStaffAttendanceDto) {
    return this.prisma.staffAttendance.create({
      data: {
        societyId: user.societyId,
        recordedById: user.userId,
        staffName: dto.staffName,
        role: dto.role,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }
}
