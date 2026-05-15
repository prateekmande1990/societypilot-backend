import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import { SecurityService } from './security.service';

@Controller('security')
export class SecurityController {
  constructor(
    private readonly securityService: SecurityService,
  ) {}

  @Post('visitors')
  createVisitorEntry(
    @Req()
    req: {
      user: {
        societyId: string;
      };
    },

    @Body()
    dto: {
      name: string;
      phone?: string;
      purpose?: string;
      vehicleNo?: string;
    },
  ) {
    return this.securityService.createVisitorEntry(
      req.user.societyId,
      dto,
    );
  }

  @Post('pre-approvals')
  createPreApproval(
    @Req()
    req: {
      user: {
        societyId: string;
        userId: string;
      };
    },

    @Body()
    dto: {
      visitorName: string;
      visitorPhone?: string;
      purpose?: string;
      validUntil: string;
    },
  ) {
    return this.securityService.createPreApproval(
      req.user.societyId,

      req.user.userId,

      dto,
    );
  }

  @Patch(
    'visitors/:visitorId/approve',
  )
  approveVisitor(
    @Param('visitorId')
    visitorId: string,
  ) {
    return this.securityService.approveVisitor(
      visitorId,
    );
  }

  @Patch(
    'visitors/:visitorId/checkin',
  )
  checkInVisitor(
    @Param('visitorId')
    visitorId: string,
  ) {
    return this.securityService.checkInVisitor(
      visitorId,
    );
  }

  @Patch(
    'visitors/:visitorId/checkout',
  )
  checkOutVisitor(
    @Param('visitorId')
    visitorId: string,
  ) {
    return this.securityService.checkOutVisitor(
      visitorId,
    );
  }

  @Get('visitors/active')
  activeVisitors(
    @Req()
    req: {
      user: {
        societyId: string;
      };
    },
  ) {
    return this.securityService.activeVisitors(
      req.user.societyId,
    );
  }
}