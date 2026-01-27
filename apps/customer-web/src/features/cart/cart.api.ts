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
  // ✅ FIX: Send ONLY what the new backend expects
  const payload = {
    productId: item.productId,
    quantity: item.quantity,
    outletId: item.outletId
  };
  const res = await customerAxios.post("/cart/items", payload);
  return transformCartResponse(res.data.data);
};

export const updateCartItem = async (productId: string, quantity: number): Promise<Cart> => {
  // ✅ FIX: Use PATCH for updates
  const res = await customerAxios.patch(`/cart/items/${productId}`, { quantity });
  return transformCartResponse(res.data.data);
};

export const removeCartItem = async (productId: string): Promise<Cart> => {
  // ✅ FIX: Use DELETE method as per your new backend
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

// ✅ UPDATE: Accept addressId and send it in the body
export const checkout = async (addressId?: string): Promise<Cart> => {
  // If addressId is provided (from the new checkout flow), send it.
  // Otherwise send empty object (backward compatibility).
  const payload = addressId ? { addressId } : {};
  
  const res = await customerAxios.post("/cart/checkout", payload); 
  return transformCartResponse(res.data.data);
};