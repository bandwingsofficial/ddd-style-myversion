import customerAxios from '@/http/axios/customerAxios';

export interface DeliveryChargePreview {
  subtotal: number;
  discount: number;
  netSubtotal: number;
  afterDiscountTotal: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  freeDeliveryThreshold: number | null;
  remainingForFreeDelivery: number | null;
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

export async function previewDeliveryCharge(params: {
  subtotal: number;
  netSubtotal?: number;
}): Promise<DeliveryChargePreview> {
  const res = await customerAxios.get('/public/delivery/preview', {
    params: {
      subtotal: params.subtotal,
      netSubtotal: params.netSubtotal ?? params.subtotal,
    },
  });
  return res.data.data;
}

export async function fetchDeliveryConfig() {
  const res = await customerAxios.get('/public/delivery/config');
  return res.data.data;
}

/** Emergency fallback only when the delivery preview API is unreachable. */
export function buildFallbackDeliveryPreview(params: {
  subtotal: number;
  netSubtotal?: number;
}): DeliveryChargePreview {
  const subtotal = params.subtotal;
  const netSubtotal = params.netSubtotal ?? subtotal;
  const discount = Number(Math.max(0, subtotal - netSubtotal).toFixed(2));

  if (subtotal <= 0) {
    return {
      subtotal: 0,
      discount: 0,
      netSubtotal: 0,
      afterDiscountTotal: 0,
      deliveryFee: 0,
      isFreeDelivery: true,
      freeDeliveryThreshold: null,
      remainingForFreeDelivery: null,
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

  const freeDeliveryThreshold = 250;
  const basisSubtotal = netSubtotal;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - basisSubtotal);

  return {
    subtotal,
    discount,
    netSubtotal,
    afterDiscountTotal: netSubtotal,
    deliveryFee: 30,
    isFreeDelivery: false,
    freeDeliveryThreshold,
    remainingForFreeDelivery:
      remainingForFreeDelivery > 0 ? remainingForFreeDelivery : null,
    deliveryRuleId: null,
    deliveryRuleName: 'Default Delivery',
    matchedDeliveryRuleId: null,
    matchedDeliveryRuleName: 'Default Delivery',
    minimumOrderAmount: 0,
    amountToFreeDelivery:
      remainingForFreeDelivery > 0 ? remainingForFreeDelivery : null,
    remainingAmountForFreeDelivery:
      remainingForFreeDelivery > 0 ? remainingForFreeDelivery : null,
    remainingAmountForNextRule: null,
    isFallback: true,
  };
}
