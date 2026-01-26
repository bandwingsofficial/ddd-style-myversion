import customerAxios from "@/http/axios/customerAxios";
import { Cart, CartItem } from "./cart.types";

export const fetchCart = async (): Promise<Cart> => {
  const res = await customerAxios.get("/cart");
  // ✅ FIX: Default to empty items if data is null
  return res.data.data || { items: [] };
};

export const addToCart = async (item: CartItem): Promise<Cart> => {
  const payload = {
    outletId: item.outletId, 
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage,
    unitPrice: item.unitPrice,
    discountPrice: item.discountPrice,
    quantity: item.quantity
  };
  const res = await customerAxios.post("/cart/items", payload);
  return res.data.data || { items: [] };
};

export const updateCartItem = async (productId: string, quantity: number): Promise<Cart> => {
  const res = await customerAxios.post(`/cart/items/${productId}`, { quantity });
  return res.data.data || { items: [] };
};

export const removeCartItem = async (productId: string): Promise<Cart> => {
  const res = await customerAxios.post(`/cart/items/${productId}/remove`);
  
  // ✅ CRITICAL FIX: Backend returns NULL when cart becomes empty.
  if (!res.data.data) {
    return { items: [] };
  }
  
  return res.data.data;
};

export const clearCart = async (): Promise<void> => {
  await customerAxios.post("/cart/clear");
};

// ✅ CHECKOUT: No payload required as per your latest backend response
export const checkout = async (): Promise<Cart> => {
  const res = await customerAxios.post("/cart/checkout", {}); 
  return res.data.data;
};