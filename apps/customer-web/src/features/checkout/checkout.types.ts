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

// ✅ UPDATED: Includes Razorpay Order Details and OrderNumber for UI
export interface CheckoutStartResponse {
  orderId: string;        // The UUID (Internal)
  orderNumber: string;   // The readable ID (e.g., CNT-2026...)
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