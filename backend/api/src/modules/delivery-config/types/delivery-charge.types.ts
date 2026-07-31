export interface DeliveryChargeResult {
  deliveryFee: number;
  isFreeDelivery: boolean;
  deliveryRuleId: string | null;
  deliveryRuleName: string | null;
  minimumOrderAmount: number;
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
