import { DeliveryChargeResult } from '../types/delivery-charge.types';

/**
 * Normalized delivery charge payload for all API consumers.
 * Single shape for cart, checkout, guest preview, and public config.
 */
export function mapDeliveryChargeToResponse(charge: DeliveryChargeResult) {
  const deliveryFee = charge.deliveryFee;
  const isFreeDelivery = deliveryFee === 0;

  return {
    deliveryFee,
    isFreeDelivery,
    deliveryRuleId: charge.deliveryRuleId,
    deliveryRuleName: charge.deliveryRuleName,
    matchedDeliveryRuleId: charge.deliveryRuleId,
    matchedDeliveryRuleName: charge.deliveryRuleName,
    minimumOrderAmount: charge.minimumOrderAmount,
    amountToFreeDelivery: charge.amountToFreeDelivery,
    remainingAmountForFreeDelivery: charge.amountToFreeDelivery,
    remainingAmountForNextRule: charge.remainingAmountForNextRule,
    isFallback: charge.isFallback,
  };
}
