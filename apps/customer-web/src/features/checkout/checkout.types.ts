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
    lineTotal: number; // API uses 'lineTotal' here
  }[];
  subtotal: number;
  discount: number;
  afterDiscountTotal: number;
  deliveryFee: number;
  grandTotal: number;
  itemCount: number;
  currency: string;
}

export interface CheckoutStartResponse {
  orderId: string;
  paymentId: string;
  checkoutUrl: string;
}

export interface OrderDetails {
  id: string;
  customerId: string;
  outletId: string;
  cartId: string;
  status: "PAYMENT_PENDING" | "PAID" | "FAILED" | "CANCELLED";
  address: {
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
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    discountPrice: number;
    totalPrice: number; // API uses 'totalPrice' here (different from summary)
    createdAt: string;
  }[];
}