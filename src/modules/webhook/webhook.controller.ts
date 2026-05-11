import { Body, Controller, Headers, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Public()
  @Post('whatsapp')
  whatsappWebhook(
    @Headers('x-hub-signature') signature: string | undefined,
    @Body() payload: Record<string, unknown>,
  ) {
    return this.webhookService.handleWhatsappWebhook(signature, payload);
  }
}
