import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { DeliveryRuleRepository } from '../repositories/delivery-rule.repository';
import { DELIVERY_FALLBACK } from '../constants/delivery-fallback.constants';
import {
  DeliveryChargeInput,
  DeliveryChargeResult,
  DeliveryRuleCandidate,
} from '../types/delivery-charge.types';

@Injectable()
export class DeliveryChargeService {
  constructor(private readonly deliveryRuleRepo: DeliveryRuleRepository) {}

  /**
   * Single source of truth for delivery fee and free-delivery progress.
   * Rule matching and free-delivery progress use net subtotal (after discounts).
   */
  async calculate(
    params: DeliveryChargeInput | {
      subtotal: Prisma.Decimal | number;
      discount: Prisma.Decimal | number;
      netSubtotal: Prisma.Decimal | number;
      itemCount: number;
    },
  ): Promise<DeliveryChargeResult> {
    const subtotal = Number(params.subtotal);
    const discount = Number(params.discount);
    const netSubtotal = Number(params.netSubtotal);
    const itemCount = params.itemCount;

    if (itemCount <= 0) {
      return this.emptyCartResult(subtotal, discount, netSubtotal);
    }

    const merchandiseSubtotal = netSubtotal;
    const activeRules = await this.deliveryRuleRepo.findActiveOrderedByMinDesc();
    const hasActiveRules = activeRules.length > 0;
    const candidates = this.buildCandidates(activeRules);
    const matched = this.matchRule(candidates, merchandiseSubtotal, hasActiveRules);

    const deliveryFee = matched.isFreeDelivery ? 0 : matched.deliveryFee;
    const isFreeDelivery = deliveryFee === 0;

    const freeDeliveryThreshold = this.computeFreeDeliveryThreshold(
      candidates,
      merchandiseSubtotal,
      isFreeDelivery,
      matched,
    );

    const remainingForFreeDelivery = isFreeDelivery
      ? null
      : this.computeRemainingForFreeDelivery(
          freeDeliveryThreshold,
          merchandiseSubtotal,
        );

    const remainingAmountForNextRule = this.computeRemainingForNextRule(
      candidates,
      merchandiseSubtotal,
    );

    return {
      subtotal,
      discount,
      netSubtotal,
      deliveryFee,
      isFreeDelivery,
      freeDeliveryThreshold,
      remainingForFreeDelivery,
      deliveryRuleId: matched.id,
      deliveryRuleName: matched.name,
      minimumOrderAmount: matched.minimumOrderAmount,
      amountToFreeDelivery: remainingForFreeDelivery,
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

  async previewForTotals(params: {
    subtotal: number;
    netSubtotal?: number;
    discount?: number;
    itemCount?: number;
  }): Promise<DeliveryChargeResult> {
    const subtotal = params.subtotal;
    const netSubtotal = params.netSubtotal ?? subtotal;
    const discount =
      params.discount ?? Number(Math.max(0, subtotal - netSubtotal).toFixed(2));

    return this.calculate({
      subtotal,
      discount,
      netSubtotal,
      itemCount: params.itemCount ?? (subtotal > 0 ? 1 : 0),
    });
  }

  /** @deprecated Use previewForTotals with merchandise subtotal */
  async previewForSubtotal(subtotal: number): Promise<DeliveryChargeResult> {
    return this.previewForTotals({ subtotal, netSubtotal: subtotal });
  }

  private emptyCartResult(
    subtotal = 0,
    discount = 0,
    netSubtotal = 0,
  ): DeliveryChargeResult {
    return {
      subtotal,
      discount,
      netSubtotal,
      deliveryFee: 0,
      isFreeDelivery: true,
      freeDeliveryThreshold: null,
      remainingForFreeDelivery: null,
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
   * Pick the ACTIVE rule with the highest minimumOrderAmount where
   * merchandise subtotal >= minimumOrderAmount.
   */
  private matchRule(
    candidates: DeliveryRuleCandidate[],
    merchandiseSubtotal: number,
    hasActiveRules: boolean,
  ): DeliveryRuleCandidate {
    const matching = candidates.filter(
      (rule) => merchandiseSubtotal >= rule.minimumOrderAmount,
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

  private computeFreeDeliveryThreshold(
    candidates: DeliveryRuleCandidate[],
    merchandiseSubtotal: number,
    isFreeDelivery: boolean,
    matched: DeliveryRuleCandidate,
  ): number | null {
    const freeThresholds = candidates
      .filter((rule) => rule.isFreeDelivery || rule.deliveryFee === 0)
      .map((rule) => rule.minimumOrderAmount)
      .sort((a, b) => a - b);

    if (freeThresholds.length === 0) {
      return null;
    }

    if (isFreeDelivery) {
      if (matched.isFreeDelivery || matched.deliveryFee === 0) {
        return matched.minimumOrderAmount;
      }
      return freeThresholds[freeThresholds.length - 1] ?? null;
    }

    const nextFree = freeThresholds.filter(
      (min) => min > merchandiseSubtotal,
    );

    return nextFree.length > 0 ? nextFree[0] : null;
  }

  private computeRemainingForFreeDelivery(
    freeDeliveryThreshold: number | null,
    merchandiseSubtotal: number,
  ): number | null {
    if (freeDeliveryThreshold == null) {
      return null;
    }

    return Number((freeDeliveryThreshold - merchandiseSubtotal).toFixed(2));
  }

  private computeRemainingForNextRule(
    candidates: DeliveryRuleCandidate[],
    merchandiseSubtotal: number,
  ): number | null {
    const nextThresholds = candidates
      .map((rule) => rule.minimumOrderAmount)
      .filter((min) => min > merchandiseSubtotal)
      .sort((a, b) => a - b);

    if (nextThresholds.length === 0) {
      return null;
    }

    return Number((nextThresholds[0] - merchandiseSubtotal).toFixed(2));
  }
}
