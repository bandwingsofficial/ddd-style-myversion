import customerAxios from "@/http/axios/customerAxios";
import { Cart, CartItem } from "./cart.types";


// ✅ FIX: Payload is now optional or empty since API doesn't require address
export const checkout = async (): Promise<Cart> => {
  // Matches POST /cart/checkout -> Returns CART_LOCKED response
  const res = await customerAxios.post("/cart/checkout", {}); 
  return res.data.data;
};


export const fetchCart = async (): Promise<Cart> => {
  const res = await customerAxios.get("/cart");
  // ✅ FIX: If data is null (empty cart), return empty items array
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
  // ✅ FIX: Safety fallback
  return res.data.data || { items: [] };
};

export const updateCartItem = async (productId: string, quantity: number): Promise<Cart> => {
  const res = await customerAxios.post(`/cart/items/${productId}`, { quantity });
  return res.data.data || { items: [] };
};

export const removeCartItem = async (productId: string): Promise<Cart> => {
  const res = await customerAxios.post(`/cart/items/${productId}/remove`);
  
  // ✅ CRITICAL FIX: The backend returns NULL when the last item is deleted.
  // We must catch this and return an empty cart object instead.
  if (!res.data.data) {
    return { items: [] };
  }
  
  return res.data.data;
};

export const clearCart = async (): Promise<void> => {
  await customerAxios.post("/cart/clear");
};