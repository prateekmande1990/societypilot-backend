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

import { RuntimeStoreService } from '../../common/services/runtime-store.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,

    private jwtService: JwtService,

    private readonly store: RuntimeStoreService,
  ) {}

  async sendOtp(dto: SendOtpDto) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          phone: dto.phone,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found for this phone number',
      );
    }

    const otp = String(
      randomInt(100000, 999999),
    );

    await this.store.set(
      this.otpKey(dto.phone),

      JSON.stringify({
        otp,

        attempts: 0,
      }),

      5 * 60,
    );

    await this.store.del(
      this.otpLockKey(dto.phone),
    );

    return {
      message:
        'OTP sent successfully',

      phone: dto.phone,

      otp,

      expiresInSeconds: 300,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const entryRaw =
      await this.store.get(
        this.otpKey(dto.phone),
      );

    if (!entryRaw) {
      throw new BadRequestException(
        'OTP not found. Please request OTP again',
      );
    }

    const lockUntilRaw =
      await this.store.get(
        this.otpLockKey(dto.phone),
      );

    if (
      lockUntilRaw &&
      Number(lockUntilRaw) > Date.now()
    ) {
      throw new UnauthorizedException(
        'Too many failed attempts. Try again later',
      );
    }

    const entry = JSON.parse(
      entryRaw,
    ) as {
      otp: string;

      attempts: number;
    };

    if (entry.otp !== dto.otp) {
      entry.attempts += 1;

      if (entry.attempts >= 3) {
        await this.store.set(
          this.otpLockKey(dto.phone),

          String(
            Date.now() +
              15 * 60 * 1000,
          ),

          15 * 60,
        );
      }

      await this.store.set(
        this.otpKey(dto.phone),

        JSON.stringify(entry),

        5 * 60,
      );

      throw new UnauthorizedException(
        'Invalid OTP',
      );
    }

    await this.store.del(
      this.otpKey(dto.phone),
    );

    const user =
      await this.prisma.user.findUnique({
        where: {
          phone: dto.phone,
        },

        include: {
          residentFlats: {
            where: {
              isActive: true,
            },

            include: {
              flat: {
                include: {
                  tower: true,
                },
              },
            },
          },
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const primaryMapping =
      user.residentFlats.find(
        (mapping) =>
          mapping.isPrimary,
      ) ??
      user.residentFlats[0];

    const payload: JwtPayload = {
      userId: user.id,

      societyId: user.societyId,

      role: user.role,

      flatId:
        primaryMapping?.flatId ??
        null,

      towerId:
        primaryMapping?.flat
          ?.towerId ?? null,

      permissions:
        ROLE_PERMISSIONS[
          (user.role as Role) ??
            Role.TENANT
        ] ?? [],
    };

    return this.issueTokens(payload);
  }

  async refresh(dto: RefreshTokenDto) {
    const parsed =
      this.verifyRefreshToken(
        dto.refreshToken,
      );

    const refreshKey =
      this.refreshKey(
        dto.refreshToken,
      );

    const storedUserId =
      await this.store.get(
        refreshKey,
      );

    if (
      !storedUserId ||
      storedUserId !== parsed.userId
    ) {
      await this.store.del(
        refreshKey,
      );

      throw new UnauthorizedException(
        'Invalid or expired refresh token',
      );
    }

    const user =
      await this.prisma.user.findUnique({
        where: {
          id: parsed.userId,
        },

        include: {
          residentFlats: {
            where: {
              isActive: true,
            },

            include: {
              flat: {
                include: {
                  tower: true,
                },
              },
            },
          },
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'User not found',
      );
    }

    await this.store.del(
      refreshKey,
    );

    const primaryMapping =
      user.residentFlats.find(
        (mapping) =>
          mapping.isPrimary,
      ) ??
      user.residentFlats[0];

    const payload: JwtPayload = {
      userId: user.id,

      societyId: user.societyId,

      role: user.role,

      flatId:
        primaryMapping?.flatId ??
        null,

      towerId:
        primaryMapping?.flat
          ?.towerId ?? null,

      permissions:
        ROLE_PERMISSIONS[
          (user.role as Role) ??
            Role.TENANT
        ] ?? [],
    };

    return this.issueTokens(payload);
  }

  async logout(dto: RefreshTokenDto) {
    await this.store.del(
      this.refreshKey(
        dto.refreshToken,
      ),
    );

    return {
      message:
        'Logged out successfully',
    };
  }

  private async issueTokens(
    payload: JwtPayload,
  ) {
    const accessToken =
      this.jwtService.sign(
        payload,
        {
          secret:
            process.env.JWT_SECRET ??
            'dev-secret',

          expiresIn: '15m',
        },
      );

    const refreshToken =
      this.jwtService.sign(
        {
          userId: payload.userId,
        },
        {
          secret:
            process.env
              .JWT_REFRESH_SECRET ??
            'dev-refresh-secret',

          expiresIn: '7d',
        },
      );

    await this.store.set(
      this.refreshKey(
        refreshToken,
      ),

      payload.userId,

      7 * 24 * 60 * 60,
    );

    return {
      accessToken,

      refreshToken,

      expiresInSeconds:
        15 * 60,
    };
  }

  private verifyRefreshToken(
    refreshToken: string,
  ): { userId: string } {
    try {
      return this.jwtService.verify(
        refreshToken,
        {
          secret:
            process.env
              .JWT_REFRESH_SECRET ??
            'dev-refresh-secret',
        },
      ) as {
        userId: string;
      };
    } catch {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }
  }

  private otpKey(phone: string) {
    return `auth:otp:${phone}`;
  }

  private otpLockKey(
    phone: string,
  ) {
    return `auth:otp:lock:${phone}`;
  }

  private refreshKey(
    refreshToken: string,
  ) {
    return `auth:refresh:${refreshToken}`;
  }
}