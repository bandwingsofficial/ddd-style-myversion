import {
  Controller,
  Post,
  Body,
  Headers,
} from '@nestjs/common';

import { PaymentOrchestratorService } from '../services/payment-orchestrator.service';
import { PaymentWebhookDto } from '../dtos/payment-webhook.dto';

@Controller('payments/webhook')
export class PaymentWebhookController {
  constructor(
    private readonly orchestrator: PaymentOrchestratorService,
  ) {}

  /* ================================================= */
  /* WEBHOOK CALLBACK                                 */
  /* ================================================= */

@Post()
async handleWebhook(
  @Body() dto: PaymentWebhookDto,
  @Headers('x-razorpay-signature') signature?: string,
) {
  await this.orchestrator.handleWebhook({
    payload: dto.payload,
    signature,
  });

  return { received: true };
}}
