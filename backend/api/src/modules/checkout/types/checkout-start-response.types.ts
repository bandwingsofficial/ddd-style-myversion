export interface CheckoutStartCustomerContact {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface CheckoutStartPaymentTotals {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  grandTotal: number;
}

export interface CheckoutStartResult extends CheckoutStartCustomerContact {
  checkoutId: string;
  orderId: string;
  orderNumber: string;
  paymentId: string;
  razorpayOrderId: string;
  /** Amount in paise (grandTotal × 100) */
  amount: number;
  razorpayAmount: number;
  currency: string;
  key: string;
  isRetry: boolean;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  grandTotal: number;
}
