import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookAmenityDto } from './dto/book-amenity.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class AmenitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async bookAmenity(user: JwtPayload, amenityId: string, dto: BookAmenityDto) {
    const amenity = await this.prisma.amenity.findUnique({ where: { id: amenityId } });
    if (!amenity || amenity.societyId !== user.societyId || !amenity.isActive) {
      throw new NotFoundException('Amenity not found');
    }

    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    if (endsAt <= startsAt) {
      throw new BadRequestException('Booking end time must be after start time');
    }

    const conflict = await this.prisma.amenityBooking.findFirst({
      where: {
        societyId: user.societyId,
        amenityId,
        status: 'CONFIRMED',
        AND: [{ startsAt: { lt: endsAt } }, { endsAt: { gt: startsAt } }],
      },
    });

    if (conflict) {
      throw new BadRequestException('Selected slot is already booked');
    }

    return this.prisma.amenityBooking.create({
      data: {
        societyId: user.societyId,
        amenityId,
        userId: user.userId,
        startsAt,
        endsAt,
      },
    });
  }
}
