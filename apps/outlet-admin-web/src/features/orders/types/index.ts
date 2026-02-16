export type OrderStatus = 
  | 'PAYMENT_PENDING' 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'ACCEPTED'      // Added to fix the red error in image 4
  | 'PREPARING' 
  | 'READY'         // Added to match your hook logic
  | 'DISPATCH'      // Added to match your hook logic
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELLED'
  | 'REJECTED';

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
  latitude: number;
  longitude: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string; 
  customerFullName: string;
  address?: CustomerAddress; 
  subtotal?: number;
  discount?: number;
  afterDiscountTotal?: number;
  deliveryFee?: number;
  grandTotal: number;
  itemCount: number;
  status: OrderStatus;
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