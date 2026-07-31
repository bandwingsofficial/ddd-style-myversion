export interface DeliveryChargeResult {
  subtotal: number;
  discount: number;
  netSubtotal: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  freeDeliveryThreshold: number | null;
  remainingForFreeDelivery: number | null;
  deliveryRuleId: string | null;
  deliveryRuleName: string | null;
  minimumOrderAmount: number;
  /** @deprecated Use remainingForFreeDelivery */
  amountToFreeDelivery: number | null;
  remainingAmountForNextRule: number | null;
  isFallback: boolean;
}

export interface DeliveryRuleCandidate {
  id: string | null;
  name: string;
  minimumOrderAmount: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
}

export interface DeliveryChargeInput {
  /** Merchandise subtotal before product discounts (MRP total) */
  subtotal: number;
  discount: number;
  /** Subtotal minus product discounts */
  netSubtotal: number;
  itemCount: number;
}
