import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  // Placeholder for now
  getHello() {
    return { message: 'Auth Module is working!' };
  }
}