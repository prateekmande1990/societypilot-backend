import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

@Injectable()
export class WebhookService {
  handleWhatsappWebhook(
    signature: string | undefined,
    payload: Record<string, unknown>,
  ) {
    const secret = process.env.WHATSAPP_WEBHOOK_SECRET ?? '';

    if (secret) {
      if (!signature) {
        throw new UnauthorizedException('Missing webhook signature');
      }

      const expected = `sha256=${createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex')}`;

      const a = Buffer.from(signature);
      const b = Buffer.from(expected);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    return {
      received: true,
      provider: 'whatsapp',
      event: payload?.entry ? 'message' : 'unknown',
    };
  }
}
