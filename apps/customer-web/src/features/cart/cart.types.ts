export interface CartItem {
  id?: string;
  productId: string;
  cartId?: string;
  outletId?: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  discountPrice: number;
  lineTotal?: number;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface Cart {
  id?: string;
  customerId?: string;
  outletId?: string;
  subtotal?: number;
  discount?: number;
  afterDiscountTotal?: number;
  deliveryFee?: number;
  grandTotal?: number;
  itemCount?: number;
  deliveryRuleId?: string | null;
  deliveryRuleName?: string | null;
  isFreeDelivery?: boolean;
  amountToFreeDelivery?: number | null;
  items: CartItem[];
  currency?: string;
  status?: string;
}
