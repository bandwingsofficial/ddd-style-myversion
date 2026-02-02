export type OrderStatus = 
  | 'PENDING' // Assuming initial state before accept
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerAddress {
  label: string;
  addressText: string;
  latitude: number;
  longitude: number;
}

export interface Order {
  id: string;
  customerId: string;
  outletId: string;
  address: CustomerAddress;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  grandTotal: number;
  itemCount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  code: string;
  message: string;
  data: Order[];
}