import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSocietyProfileDto } from './dto/update-society-profile.dto';
import { AssignUserRoleDto } from './dto/assign-user-role.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class AdminSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async updateSocietyProfile(user: JwtPayload, dto: UpdateSocietyProfileDto) {
    const society = await this.prisma.society.findUnique({
      where: { id: user.societyId },
    });
    if (!society) throw new NotFoundException('Society not found');
    return this.prisma.society.update({
      where: { id: user.societyId },
      data: dto,
    });
  }

  async assignUserRole(user: JwtPayload, dto: AssignUserRoleDto) {
    const target = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!target || target.societyId !== user.societyId) {
      throw new NotFoundException('User not found in this society');
    }
    return this.prisma.user.update({
      where: { id: dto.userId },
      data: { role: dto.role },
    });
  }
}
