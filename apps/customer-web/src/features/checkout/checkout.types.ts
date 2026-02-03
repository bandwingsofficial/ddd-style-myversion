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
  afterDiscountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  itemCount: number;
  currency: string;
}

export interface CheckoutStartRequest {
  outletId: string;
  savedAddressId: string;
}

// ✅ UPDATED: Includes Razorpay Order Details
export interface CheckoutStartResponse {
  orderId: string;
  paymentId: string;
  razorpayOrderId: string; // "order_..." from Razorpay
  amount: number;          // Amount in paisa
  currency: string;
  key?: string;            // Backend might send key
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
  };
}

export interface OrderDetails {
  id: string;
  customerId: string;
  outletId: string;
  cartId: string;
  status: "PAYMENT_PENDING" | "PAID" | "FAILED" | "CANCELLED" | "Delivered";
  address: {
    id: string;
    label: string;
    addressText: string;
    latitude: number;
    longitude: number;
  };
  subtotal: number;
  discount: number;
  afterDiscountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  itemCount: number;
  items: any[];
  createdAt: string;
}