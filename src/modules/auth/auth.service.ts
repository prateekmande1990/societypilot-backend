import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ROLE_PERMISSIONS } from './constants/role-permissions';
import { Role } from '../../common/enums/role.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './types/jwt-payload.type';

type OtpEntry = {
  otp: string;
  expiresAt: number;
  attempts: number;
  lockUntil?: number;
};

@Injectable()
export class AuthService {
  private readonly otpStore = new Map<string, OtpEntry>();
  private readonly refreshStore = new Map<string, { userId: string; expiresAt: number }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async sendOtp(dto: SendOtpDto) {
    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) {
      throw new NotFoundException('User not found for this phone number');
    }

    const otp = String(randomInt(100000, 999999));
    this.otpStore.set(dto.phone, {
      otp,
      attempts: 0,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    return {
      message: 'OTP sent successfully',
      phone: dto.phone,
      otp,
      expiresInSeconds: 300,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const entry = this.otpStore.get(dto.phone);
    if (!entry) {
      throw new BadRequestException('OTP not found. Please request OTP again');
    }

    if (entry.lockUntil && entry.lockUntil > Date.now()) {
      throw new UnauthorizedException('Too many failed attempts. Try again later');
    }

    if (entry.expiresAt < Date.now()) {
      this.otpStore.delete(dto.phone);
      throw new UnauthorizedException('OTP expired');
    }

    if (entry.otp !== dto.otp) {
      entry.attempts += 1;
      if (entry.attempts >= 3) {
        entry.lockUntil = Date.now() + 15 * 60 * 1000;
      }
      this.otpStore.set(dto.phone, entry);
      throw new UnauthorizedException('Invalid OTP');
    }

    this.otpStore.delete(dto.phone);

    const user = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const payload: JwtPayload = {
      userId: user.id,
      societyId: user.societyId,
      role: user.role,
      flatId: user.flatId,
      towerId: user.towerId,
      permissions: ROLE_PERMISSIONS[(user.role as Role) ?? Role.TENANT] ?? [],
    };

    return this.issueTokens(payload);
  }

  async refresh(dto: RefreshTokenDto) {
    const parsed = this.verifyRefreshToken(dto.refreshToken);
    const stored = this.refreshStore.get(dto.refreshToken);

    if (!stored || stored.expiresAt < Date.now()) {
      this.refreshStore.delete(dto.refreshToken);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: parsed.userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.refreshStore.delete(dto.refreshToken);

    const payload: JwtPayload = {
      userId: user.id,
      societyId: user.societyId,
      role: user.role,
      flatId: user.flatId,
      towerId: user.towerId,
      permissions: ROLE_PERMISSIONS[(user.role as Role) ?? Role.TENANT] ?? [],
    };

    return this.issueTokens(payload);
  }

  async logout(dto: RefreshTokenDto) {
    this.refreshStore.delete(dto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  private issueTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'dev-secret',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(
      { userId: payload.userId },
      {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
        expiresIn: '7d',
      },
    );

    this.refreshStore.set(refreshToken, {
      userId: payload.userId,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken,
      refreshToken,
      expiresInSeconds: 15 * 60,
    };
  }

  private verifyRefreshToken(refreshToken: string): { userId: string } {
    try {
      return this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
      }) as { userId: string };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
