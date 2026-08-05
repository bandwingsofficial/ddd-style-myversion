/** Matches backend OrderStatus enum. */
export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';

export type OutletPaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  discountPrice?: number;
  totalPrice: number;
  createdAt?: string;
}

export interface CustomerAddress {
  label: string;
  addressText: string;
  houseNumber?: string | null;
  street?: string | null;
  landmark?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface OrderCustomer {
  id: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customer?: OrderCustomer;
  /** Resolved display label from API — prefer resolveOrderCustomer() */
  customerFullName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  address?: CustomerAddress;
  subtotal?: number;
  discount?: number;
  afterDiscountTotal?: number;
  deliveryFee?: number;
  grandTotal: number;
  itemCount: number;
  status: OrderStatus;
  paymentStatus?: OutletPaymentStatus;
  items?: OrderItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderResponse {
  success: boolean;
  code: string;
  message: string;
  data: Order[];
}

export interface SingleOrderResponse {
  success: boolean;
  code: string;
  message: string;
  data: Order;
}
