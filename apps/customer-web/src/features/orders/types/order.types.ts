export interface OrderAddress {
  id: string;
  label: string;
  addressText: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  outletId: string;
  cartId: string;

  status: string;

  subtotal: number;
  discount: number;
  afterDiscountTotal: number;
  deliveryFee: number;
  grandTotal: number;

  itemCount: number;

  address: OrderAddress;
  items: OrderItem[];

  createdAt: string;
}

export type OrdersResponse = Order[];