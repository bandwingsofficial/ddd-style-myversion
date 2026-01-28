import customerAxios from "@/http/axios/customerAxios";
import { Cart, CartItem } from "./cart.types";

// ✅ HELPER: Convert backend strings to numbers to prevent UI crashes
const transformCartResponse = (data: any): Cart => {
  if (!data) return { items: [] };

  return {
    ...data,
    grandTotal: Number(data.grandTotal || 0),
    items: (data.items || []).map((item: any) => ({
      ...item,
      // Force conversion to numbers so math works in UI
      unitPrice: Number(item.unitPrice),
      discountPrice: Number(item.discountPrice),
      quantity: Number(item.quantity),
    }))
  };
};

export const fetchCart = async (): Promise<Cart> => {
  const res = await customerAxios.get("/cart");
  return transformCartResponse(res.data.data);
};

export const addToCart = async (item: CartItem): Promise<Cart> => {
  // ✅ FIX: Dynamic Payload Construction
  // This prevents sending "outletId: undefined" which causes 500 Server Errors
  const payload: Record<string, any> = {
    productId: item.productId,
    quantity: item.quantity,
  };

  // Only attach outletId if it exists (Guest items usually have this)
  if (item.outletId) {
    payload.outletId = item.outletId;
  }

  const res = await customerAxios.post("/cart/items", payload);
  return transformCartResponse(res.data.data);
};

export const updateCartItem = async (productId: string, quantity: number): Promise<Cart> => {
  const res = await customerAxios.patch(`/cart/items/${productId}`, { quantity });
  return transformCartResponse(res.data.data);
};

export const removeCartItem = async (productId: string): Promise<Cart> => {
  const res = await customerAxios.delete(`/cart/items/${productId}`);
  
  // If backend returns null (empty cart), return safe empty object
  if (!res.data.data) {
    return { items: [] };
  }
  return transformCartResponse(res.data.data);
};

export const clearCart = async (): Promise<void> => {
  await customerAxios.post("/cart/clear");
};

export const checkout = async (addressId?: string): Promise<Cart> => {
  const payload = addressId ? { addressId } : {};
  const res = await customerAxios.post("/cart/checkout", payload); 
  return transformCartResponse(res.data.data);
};