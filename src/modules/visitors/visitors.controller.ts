import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import { VisitorsService } from './visitors.service';

import { CreateVisitorDto } from './dto/create-visitor.dto';
import { ApproveVisitorDto } from './dto/approve-visitor.dto';
import { CreatePreApprovalDto } from './dto/create-preapproval.dto';
import { UpdateVisitorStatusDto } from './dto/update-visitor-status.dto';

@Controller('visitors')
export class VisitorsController {
  constructor(
    private readonly visitorsService: VisitorsService,
  ) {}

  @Post(
    'societies/:societyId/flats/:flatId',
  )
  createVisitor(
    @Param('societyId')
    societyId: string,

    @Param('flatId')
    flatId: string,

    @Body()
    dto: CreateVisitorDto,
  ) {
    return this.visitorsService.createVisitor(
      societyId,
      flatId,
      dto,
    );
  }

  @Patch(':visitorId/approve')
  approveVisitor(
    @Param('visitorId')
    visitorId: string,

    @Req()
    req: {
      user: {
        userId: string;
      };
    },

    @Body()
    dto: ApproveVisitorDto,
  ) {
    return this.visitorsService.approveVisitor(
      visitorId,

      req.user.userId,

      dto,
    );
  }

  @Patch(':visitorId/status')
  updateVisitorStatus(
    @Param('visitorId')
    visitorId: string,

    @Body()
    dto: UpdateVisitorStatusDto,
  ) {
    return this.visitorsService.updateVisitorStatus(
      visitorId,
      dto,
    );
  }

  @Post(
    'societies/:societyId/flats/:flatId/pre-approvals',
  )
  createPreApproval(
    @Param('societyId')
    societyId: string,

    @Param('flatId')
    flatId: string,

    @Req()
    req: {
      user: {
        userId: string;
      };
    },

    @Body()
    dto: CreatePreApprovalDto,
  ) {
    return this.visitorsService.createPreApproval(
      societyId,

      req.user.userId,

      flatId,

      dto,
    );
  }

  @Get('active/:societyId')
  activeVisitors(
    @Param('societyId')
    societyId: string,
  ) {
    return this.visitorsService.activeVisitors(
      societyId,
    );
  }

  @Get('logs/:societyId')
  visitorLogs(
    @Param('societyId')
    societyId: string,
  ) {
    return this.visitorsService.visitorLogs(
      societyId,
    );
  }
}