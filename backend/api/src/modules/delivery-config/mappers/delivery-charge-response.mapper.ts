import { DeliveryChargeResult } from '../types/delivery-charge.types';

/**
 * Normalized delivery + pricing payload for all API consumers.
 */
export function mapDeliveryChargeToResponse(charge: DeliveryChargeResult) {
  const deliveryFee = charge.deliveryFee;
  const isFreeDelivery = deliveryFee === 0;

  return {
    subtotal: charge.subtotal,
    discount: charge.discount,
    netSubtotal: charge.netSubtotal,
    afterDiscountTotal: charge.netSubtotal,
    deliveryFee,
    isFreeDelivery,
    freeDeliveryThreshold: charge.freeDeliveryThreshold,
    remainingForFreeDelivery: charge.remainingForFreeDelivery,
    deliveryRuleId: charge.deliveryRuleId,
    deliveryRuleName: charge.deliveryRuleName,
    matchedDeliveryRuleId: charge.deliveryRuleId,
    matchedDeliveryRuleName: charge.deliveryRuleName,
    minimumOrderAmount: charge.minimumOrderAmount,
    amountToFreeDelivery: charge.remainingForFreeDelivery,
    remainingAmountForFreeDelivery: charge.remainingForFreeDelivery,
    remainingAmountForNextRule: charge.remainingAmountForNextRule,
    isFallback: charge.isFallback,
  };
}
