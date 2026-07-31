import customerAxios from '@/http/axios/customerAxios';

export interface DeliveryChargePreview {
  deliveryFee: number;
  isFreeDelivery: boolean;
  deliveryRuleId: string | null;
  deliveryRuleName: string | null;
  matchedDeliveryRuleId: string | null;
  matchedDeliveryRuleName: string | null;
  minimumOrderAmount: number;
  amountToFreeDelivery: number | null;
  remainingAmountForFreeDelivery: number | null;
  remainingAmountForNextRule: number | null;
  isFallback: boolean;
}

export async function previewDeliveryCharge(
  subtotal: number,
): Promise<DeliveryChargePreview> {
  const res = await customerAxios.get('/public/delivery/preview', {
    params: { subtotal },
  });
  return res.data.data;
}

export async function fetchDeliveryConfig() {
  const res = await customerAxios.get('/public/delivery/config');
  return res.data.data;
}

/** Emergency fallback only when the delivery preview API is unreachable. */
export function buildFallbackDeliveryPreview(
  afterDiscountTotal: number,
): DeliveryChargePreview {
  if (afterDiscountTotal <= 0) {
    return {
      deliveryFee: 0,
      isFreeDelivery: true,
      deliveryRuleId: null,
      deliveryRuleName: null,
      matchedDeliveryRuleId: null,
      matchedDeliveryRuleName: null,
      minimumOrderAmount: 0,
      amountToFreeDelivery: null,
      remainingAmountForFreeDelivery: null,
      remainingAmountForNextRule: null,
      isFallback: true,
    };
  }

  return {
    deliveryFee: 30,
    isFreeDelivery: false,
    deliveryRuleId: null,
    deliveryRuleName: 'Default Delivery',
    matchedDeliveryRuleId: null,
    matchedDeliveryRuleName: 'Default Delivery',
    minimumOrderAmount: 0,
    amountToFreeDelivery: null,
    remainingAmountForFreeDelivery: null,
    remainingAmountForNextRule: null,
    isFallback: true,
  };
}
