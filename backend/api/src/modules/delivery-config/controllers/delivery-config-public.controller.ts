import { Controller, Get, Query } from '@nestjs/common';

import { Public } from '../../../common/decorators/public.decorator';
import { ValidationError } from '../../../common/errors';
import { DeliveryConfigOrchestratorService } from '../services/delivery-config-orchestrator.service';
import { mapDeliveryChargeToResponse } from '../mappers/delivery-charge-response.mapper';

@Controller('public/delivery')
@Public()
export class DeliveryConfigPublicController {
  constructor(
    private readonly orchestrator: DeliveryConfigOrchestratorService,
  ) {}

  @Get('config')
  async getConfig() {
    const data = await this.orchestrator.getPublicConfig();

    return {
      success: true,
      code: 'DELIVERY_CONFIG_FETCHED',
      message: 'Delivery configuration fetched successfully',
      data: {
        rules: data.rules,
        hasActiveRules: data.hasActiveRules,
        fallback: data.fallback,
      },
    };
  }

  @Get('preview')
  async preview(
    @Query('subtotal') subtotalRaw?: string,
    @Query('netSubtotal') netSubtotalRaw?: string,
  ) {
    const subtotal = Number(subtotalRaw);
    if (Number.isNaN(subtotal) || subtotal < 0) {
      throw new ValidationError(
        'INVALID_SUBTOTAL',
        'A valid subtotal query parameter is required',
      );
    }

    const netSubtotal =
      netSubtotalRaw != null && netSubtotalRaw !== ''
        ? Number(netSubtotalRaw)
        : subtotal;

    if (Number.isNaN(netSubtotal) || netSubtotal < 0) {
      throw new ValidationError(
        'INVALID_NET_SUBTOTAL',
        'netSubtotal must be a valid non-negative number',
      );
    }

    const charge = mapDeliveryChargeToResponse(
      await this.orchestrator.previewCharge({
        subtotal,
        netSubtotal,
        itemCount: subtotal > 0 ? 1 : 0,
      }),
    );

    return {
      success: true,
      code: 'DELIVERY_CHARGE_PREVIEWED',
      message: 'Delivery charge preview calculated successfully',
      data: charge,
    };
  }
}
