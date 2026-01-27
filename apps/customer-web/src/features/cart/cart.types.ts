export interface CartItem {
  id?: string; // Cart Item ID (from backend)
  productId: string;
  cartId?: string;
  outletId?: string;
  
  // Product Details
  productName: string;
  productImage: string;
  
  // Price & Qty
  quantity: number;
  unitPrice: number;     // Converted to number in API
  discountPrice: number; // Converted to number in API
  lineTotal?: number;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  id?: string;
  customerId?: string;
  outletId?: string;
  
  // Backend Totals (New)
  subtotal?: number | string;
  discount?: number | string;
  deliveryFee?: number | string;
  grandTotal?: number | string;
  itemCount?: number;

  items: CartItem[];
  currency?: string;
  status?: string;
}