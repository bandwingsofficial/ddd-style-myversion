export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  discountPrice: number;
}

export interface Cart {
  id?: string;
  items: CartItem[];
  currency?: string;
}
