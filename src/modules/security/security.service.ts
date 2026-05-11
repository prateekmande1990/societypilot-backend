import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogVisitorEntryDto } from './dto/log-visitor-entry.dto';
import { CreatePreApprovalDto } from './dto/create-preapproval.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class SecurityService {
  constructor(private readonly prisma: PrismaService) {}

  async logVisitorEntry(societyId: string, dto: LogVisitorEntryDto) {
    return this.prisma.visitor.create({
      data: {
        societyId,
        name: dto.name,
        phone: dto.phone,
        purpose: dto.purpose,
        vehicleNo: dto.vehicleNo,
      },
    });
  }

  async createPreApproval(user: JwtPayload, dto: CreatePreApprovalDto) {
    return this.prisma.visitorPreApproval.create({
      data: {
        societyId: user.societyId,
        userId: user.userId,
        visitorName: dto.visitorName,
        visitorPhone: dto.visitorPhone,
        purpose: dto.purpose,
        validUntil: new Date(dto.validUntil),
      },
    });
  }
}
