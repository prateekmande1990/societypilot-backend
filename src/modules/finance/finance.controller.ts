import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { GenerateBillsDto } from './dto/generate-bills.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('bills')
  @Roles(Role.CHAIRMAN, Role.SECRETARY, Role.TREASURER, Role.ACCOUNTANT)
  @Permissions('finance:read')
  listBills(
    @Req() req: { user: { societyId: string } },
    @Query() query: PaginationQueryDto,
  ) {
    return this.financeService.listBills(req.user.societyId, query);
  }

  @Post('bills/generate')
  @Roles(Role.CHAIRMAN, Role.TREASURER)
  @Permissions('finance:write')
  generateBills(
    @Req() req: { user: { societyId: string } },
    @Body() dto: GenerateBillsDto,
  ) {
    return this.financeService.generateBills(req.user.societyId, dto);
  }

  @Post('payments')
  @Roles(Role.CHAIRMAN, Role.SECRETARY, Role.ACCOUNTANT, Role.TREASURER)
  @Permissions('finance:write')
  recordPayment(
    @Req() req: { user: { societyId: string } },
    @Body() dto: RecordPaymentDto,
  ) {
    return this.financeService.recordPayment(req.user.societyId, dto);
  }

  @Public()
  @Post('payments/razorpay/webhook')
  razorpayWebhook(@Body() payload: Record<string, unknown>) {
    return this.financeService.razorpayWebhook(payload);
  }

  @Get('defaulters')
  @Roles(Role.CHAIRMAN, Role.SECRETARY, Role.TREASURER, Role.ACCOUNTANT)
  @Permissions('finance:read')
  defaulters(@Req() req: { user: { societyId: string } }) {
    return this.financeService.listDefaulters(req.user.societyId);
  }

  @Get('reports/pnl')
  @Roles(Role.CHAIRMAN, Role.TREASURER, Role.ACCOUNTANT)
  @Permissions('finance:read')
  pnl(@Req() req: { user: { societyId: string } }) {
    return this.financeService.pnl(req.user.societyId);
  }
}
