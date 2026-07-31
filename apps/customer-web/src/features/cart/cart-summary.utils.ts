import { CartItem } from '@/features/cart/cart.types';
import {
  buildFallbackDeliveryPreview,
  DeliveryChargePreview,
  previewDeliveryCharge,
} from '@/features/delivery/delivery.api';

export interface CartSummary {
  subtotal: number;
  discount: number;
  afterDiscountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  itemCount: number;
  deliveryRuleId?: string | null;
  deliveryRuleName?: string | null;
  matchedDeliveryRuleId?: string | null;
  matchedDeliveryRuleName?: string | null;
  minimumOrderAmount?: number;
  isFreeDelivery: boolean;
  amountToFreeDelivery?: number | null;
  remainingAmountForFreeDelivery?: number | null;
  remainingAmountForNextRule?: number | null;
}

export const EMPTY_CART_SUMMARY: CartSummary = {
  subtotal: 0,
  discount: 0,
  afterDiscountTotal: 0,
  deliveryFee: 0,
  grandTotal: 0,
  itemCount: 0,
  isFreeDelivery: true,
  amountToFreeDelivery: null,
  remainingAmountForFreeDelivery: null,
  remainingAmountForNextRule: null,
};

export function computeLocalItemTotals(items: CartItem[]) {
  return items.reduce(
    (acc, item) => {
      const price = item.discountPrice || item.unitPrice;
      acc.subtotal += item.unitPrice * item.quantity;
      acc.afterDiscountTotal += price * item.quantity;
      acc.itemCount += item.quantity;
      return acc;
    },
    { subtotal: 0, afterDiscountTotal: 0, itemCount: 0 },
  );
}

function mapDeliveryPreviewToSummaryFields(preview: DeliveryChargePreview) {
  return {
    deliveryFee: preview.deliveryFee,
    isFreeDelivery: preview.deliveryFee === 0,
    deliveryRuleId: preview.deliveryRuleId,
    deliveryRuleName: preview.deliveryRuleName,
    matchedDeliveryRuleId: preview.matchedDeliveryRuleId,
    matchedDeliveryRuleName: preview.matchedDeliveryRuleName,
    minimumOrderAmount: preview.minimumOrderAmount,
    amountToFreeDelivery: preview.amountToFreeDelivery,
    remainingAmountForFreeDelivery: preview.remainingAmountForFreeDelivery,
    remainingAmountForNextRule: preview.remainingAmountForNextRule,
  };
}

export function mapApiCartToSummary(data: any): CartSummary {
  const deliveryFee = Number(data.deliveryFee ?? 0);

  return {
    subtotal: Number(data.subtotal ?? 0),
    discount: Number(data.discount ?? 0),
    afterDiscountTotal: Number(data.afterDiscountTotal ?? 0),
    deliveryFee,
    grandTotal: Number(data.grandTotal ?? 0),
    itemCount: Number(data.itemCount ?? 0),
    deliveryRuleId: data.deliveryRuleId ?? data.matchedDeliveryRuleId ?? null,
    deliveryRuleName: data.deliveryRuleName ?? data.matchedDeliveryRuleName ?? null,
    matchedDeliveryRuleId: data.matchedDeliveryRuleId ?? data.deliveryRuleId ?? null,
    matchedDeliveryRuleName: data.matchedDeliveryRuleName ?? data.deliveryRuleName ?? null,
    minimumOrderAmount: Number(data.minimumOrderAmount ?? 0),
    isFreeDelivery: deliveryFee === 0,
    amountToFreeDelivery:
      data.amountToFreeDelivery != null
        ? Number(data.amountToFreeDelivery)
        : null,
    remainingAmountForFreeDelivery:
      data.remainingAmountForFreeDelivery != null
        ? Number(data.remainingAmountForFreeDelivery)
        : data.amountToFreeDelivery != null
          ? Number(data.amountToFreeDelivery)
          : null,
    remainingAmountForNextRule:
      data.remainingAmountForNextRule != null
        ? Number(data.remainingAmountForNextRule)
        : null,
  };
}

export function mapPreviewToSummary(
  preview: DeliveryChargePreview,
  itemTotals: ReturnType<typeof computeLocalItemTotals>,
): CartSummary {
  const discount = itemTotals.subtotal - itemTotals.afterDiscountTotal;
  const deliveryFields = mapDeliveryPreviewToSummaryFields(preview);

  return {
    subtotal: itemTotals.subtotal,
    discount,
    afterDiscountTotal: itemTotals.afterDiscountTotal,
    grandTotal: Number(
      (itemTotals.afterDiscountTotal + preview.deliveryFee).toFixed(2),
    ),
    itemCount: itemTotals.itemCount,
    ...deliveryFields,
  };
}

export async function resolveGuestCartSummary(
  items: CartItem[],
): Promise<CartSummary> {
  const itemTotals = computeLocalItemTotals(items);

  if (itemTotals.itemCount <= 0) {
    return EMPTY_CART_SUMMARY;
  }

  try {
    const preview = await previewDeliveryCharge(itemTotals.afterDiscountTotal);
    return mapPreviewToSummary(preview, itemTotals);
  } catch {
    const preview = buildFallbackDeliveryPreview(itemTotals.afterDiscountTotal);
    return mapPreviewToSummary(preview, itemTotals);
  }
}
