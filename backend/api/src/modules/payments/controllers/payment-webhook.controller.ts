import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
} from '@nestjs/common';

import { PaymentOrchestratorService } from '../services/payment-orchestrator.service';

@Controller('payments/webhook/razorpay') // 🔥 explicit
export class PaymentWebhookController {
  constructor(
    private readonly orchestrator: PaymentOrchestratorService,
  ) {}

  /* ================================================= */
  /* 🔥 RAZORPAY WEBHOOK                               */
  /* ================================================= */

  @Post()
  @HttpCode(200) // 🔥 important for Razorpay
  async handleWebhook(
    @Body() payload: any, // 🔥 raw body (no DTO)
    @Headers('x-razorpay-signature') signature?: string,
  ) {

    await this.orchestrator.handleWebhook({
      payload,
      signature,
    });

    return { received: true };
  }
}
