export interface CartItem {
  // Required for Backend API
  productId: string;
  outletId?: string; // Required for adding, optional for display
  
  // Product Details
  productName: string;
  productImage: string;
  
  // Price & Qty
  quantity: number;
  unitPrice: number;
  discountPrice: number;
}

export interface Cart {
  id?: string;
  customerId?: string;
  outletId?: string;
  items: CartItem[];
  currency?: string;
  status?: string;
}