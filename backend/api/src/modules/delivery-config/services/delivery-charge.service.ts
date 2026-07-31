import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { DeliveryRuleRepository } from '../repositories/delivery-rule.repository';
import { DELIVERY_FALLBACK } from '../constants/delivery-fallback.constants';
import {
  DeliveryChargeResult,
  DeliveryRuleCandidate,
} from '../types/delivery-charge.types';

@Injectable()
export class DeliveryChargeService {
  constructor(private readonly deliveryRuleRepo: DeliveryRuleRepository) {}

  /**
   * Single source of truth for delivery fee calculation.
   * Used by cart, checkout, orders, and public preview — nowhere else.
   */
  async calculate(params: {
    afterDiscountTotal: Prisma.Decimal | number;
    itemCount: number;
  }): Promise<DeliveryChargeResult> {
    if (params.itemCount <= 0) {
      return this.emptyCartResult();
    }

    const subtotal = Number(params.afterDiscountTotal);
    const activeRules = await this.deliveryRuleRepo.findActiveOrderedByMinDesc();
    const hasActiveRules = activeRules.length > 0;
    const candidates = this.buildCandidates(activeRules);
    const matched = this.matchRule(candidates, subtotal, hasActiveRules);

    const deliveryFee = matched.isFreeDelivery ? 0 : matched.deliveryFee;
    const isFreeDelivery = deliveryFee === 0;

    const remainingAmountForNextRule = this.computeRemainingForNextRule(
      candidates,
      subtotal,
    );

    const amountToFreeDelivery = isFreeDelivery
      ? null
      : this.computeAmountToFreeDelivery(candidates, subtotal);

    return {
      deliveryFee,
      isFreeDelivery,
      deliveryRuleId: matched.id,
      deliveryRuleName: matched.name,
      minimumOrderAmount: matched.minimumOrderAmount,
      amountToFreeDelivery,
      remainingAmountForNextRule,
      isFallback: !hasActiveRules,
    };
  }

  async getPublicConfig(): Promise<{
    rules: Array<{
      id: string;
      name: string;
      minimumOrderAmount: number;
      deliveryFee: number;
      isFreeDelivery: boolean;
      priority: number;
    }>;
    fallback: {
      minimumOrderAmount: number;
      deliveryFee: number;
      freeDeliveryAbove: number;
    };
    hasActiveRules: boolean;
  }> {
    const activeRules = await this.deliveryRuleRepo.findActiveOrderedByMinDesc();

    return {
      rules: activeRules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        minimumOrderAmount: rule.minimumOrderAmount,
        deliveryFee: rule.deliveryFee,
        isFreeDelivery: rule.isFreeDelivery,
        priority: rule.priority,
      })),
      fallback: {
        minimumOrderAmount: 0,
        deliveryFee: DELIVERY_FALLBACK.BASE_FEE,
        freeDeliveryAbove: DELIVERY_FALLBACK.FREE_DELIVERY_MIN,
      },
      hasActiveRules: activeRules.length > 0,
    };
  }

  async previewForSubtotal(subtotal: number): Promise<DeliveryChargeResult> {
    return this.calculate({
      afterDiscountTotal: subtotal,
      itemCount: subtotal > 0 ? 1 : 0,
    });
  }

  private emptyCartResult(): DeliveryChargeResult {
    return {
      deliveryFee: 0,
      isFreeDelivery: true,
      deliveryRuleId: null,
      deliveryRuleName: null,
      minimumOrderAmount: 0,
      amountToFreeDelivery: null,
      remainingAmountForNextRule: null,
      isFallback: false,
    };
  }

  private buildCandidates(
    activeRules: Awaited<
      ReturnType<DeliveryRuleRepository['findActiveOrderedByMinDesc']>
    >,
  ): DeliveryRuleCandidate[] {
    if (activeRules.length > 0) {
      return activeRules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        minimumOrderAmount: rule.minimumOrderAmount,
        deliveryFee: rule.deliveryFee,
        isFreeDelivery: rule.isFreeDelivery,
      }));
    }

    return [
      {
        id: null,
        name: 'Default Delivery',
        minimumOrderAmount: 0,
        deliveryFee: DELIVERY_FALLBACK.BASE_FEE,
        isFreeDelivery: false,
      },
      {
        id: null,
        name: 'Free Delivery',
        minimumOrderAmount: DELIVERY_FALLBACK.FREE_DELIVERY_MIN,
        deliveryFee: 0,
        isFreeDelivery: true,
      },
    ];
  }

  /**
   * Pick the ACTIVE rule with the highest minimumOrderAmount where subtotal >= minimumOrderAmount.
   * When no rule matches, charge the platform default fee — never grant free delivery.
   */
  private matchRule(
    candidates: DeliveryRuleCandidate[],
    subtotal: number,
    hasActiveRules: boolean,
  ): DeliveryRuleCandidate {
    const matching = candidates.filter(
      (rule) => subtotal >= rule.minimumOrderAmount,
    );

    if (matching.length > 0) {
      return matching.reduce((best, rule) =>
        rule.minimumOrderAmount > best.minimumOrderAmount ? rule : best,
      );
    }

    if (hasActiveRules) {
      return {
        id: null,
        name: 'Default Delivery',
        minimumOrderAmount: 0,
        deliveryFee: DELIVERY_FALLBACK.BASE_FEE,
        isFreeDelivery: false,
      };
    }

    return {
      id: null,
      name: 'Default Delivery',
      minimumOrderAmount: 0,
      deliveryFee: DELIVERY_FALLBACK.BASE_FEE,
      isFreeDelivery: false,
    };
  }

  /** Amount needed to reach the next tier (any rule with a higher minimum). */
  private computeRemainingForNextRule(
    candidates: DeliveryRuleCandidate[],
    subtotal: number,
  ): number | null {
    const nextThresholds = candidates
      .map((rule) => rule.minimumOrderAmount)
      .filter((min) => min > subtotal)
      .sort((a, b) => a - b);

    if (nextThresholds.length === 0) {
      return null;
    }

    return Number((nextThresholds[0] - subtotal).toFixed(2));
  }

  /** Amount needed to reach the nearest free-delivery tier. */
  private computeAmountToFreeDelivery(
    candidates: DeliveryRuleCandidate[],
    subtotal: number,
  ): number | null {
    const freeThresholds = candidates
      .filter((rule) => rule.isFreeDelivery || rule.deliveryFee === 0)
      .map((rule) => rule.minimumOrderAmount)
      .filter((min) => min > subtotal)
      .sort((a, b) => a - b);

    if (freeThresholds.length === 0) {
      return null;
    }

    return Number((freeThresholds[0] - subtotal).toFixed(2));
  }
}
