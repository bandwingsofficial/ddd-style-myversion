export interface CheckoutSummary {
  address: {
    id: string;
    label: string;
    addressText: string;
    latitude: number;
    longitude: number;
  };
  items: {
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    discountPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  discount: number;
  netSubtotal: number;
  afterDiscountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  itemCount: number;
  deliveryRuleId?: string | null;
  deliveryRuleName?: string | null;
  matchedDeliveryRuleId?: string | null;
  matchedDeliveryRuleName?: string | null;
  minimumOrderAmount?: number;
  isFreeDelivery?: boolean;
  freeDeliveryThreshold?: number | null;
  remainingForFreeDelivery?: number | null;
  amountToFreeDelivery?: number | null;
  remainingAmountForFreeDelivery?: number | null;
  remainingAmountForNextRule?: number | null;
  currency: string;
}

export interface CheckoutStartRequest {
  outletId: string;
  savedAddressId: string;
}

// Includes Razorpay order details, checkout totals, and authenticated customer contact
export interface CheckoutStartResponse {
  checkoutId: string;
  orderId: string;
  orderNumber: string;
  paymentId: string;
  razorpayOrderId: string;
  /** Amount in paise (grandTotal × 100) */
  amount: number;
  razorpayAmount: number;
  currency: string;
  key?: string;
  isRetry?: boolean;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  grandTotal: number;
}

// ✅ NEW: Payload to verify the signature on backend
export interface PaymentVerificationRequest {
  orderId: string;
  paymentId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

export interface CheckoutErrorResponse {
  success: boolean;
  code: string;
  message: string;
  metadata?: {
    orderId?: string;
    orderNumber?: string; // Added to handle display in error modals
  };
}

// ✅ UPDATED: Reflects the actual API response for order listings and details
export interface OrderDetails {
  id: string;             // UUID
  orderNumber: string;    // Readable ID (Added for standard display)
  customerId: string;
  customerFullName?: string; // Seen in your outlet-order response
  outletId: string;
  cartId: string;
  status: "PAYMENT_PENDING" | "PAID" | "FAILED" | "CANCELLED" | "DELIVERED";
  address: {
    id?: string;
    label: string;
    addressText: string;
    latitude: number;
    longitude: number;
  };
  subtotal: number;
  discount: number;
  netSubtotal?: number;
  afterDiscountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  itemCount: number;
  items: {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    discountPrice: number;
    totalPrice: number; // Matches your outlet-order detail JSON
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt?: string;
}