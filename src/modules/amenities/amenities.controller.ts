import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { BookAmenityDto } from './dto/book-amenity.dto';

@Controller('amenities')
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Post(':id/book')
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.TREASURER,
    Role.JOINT_SECRETARY,
    Role.COMMITTEE_MEMBER,
    Role.TOWER_CAPTAIN,
    Role.OWNER_RESIDENT,
    Role.OWNER_NONRESIDENT,
    Role.TENANT,
    Role.FAMILY_MEMBER,
  )
  @Permissions('amenities:book')
  bookAmenity(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: BookAmenityDto,
  ) {
    return this.amenitiesService.bookAmenity(req.user, id, dto);
  }
}
