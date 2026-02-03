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

export const fetchCart = async (outletId?: string): Promise<Cart> => {
  const params: Record<string, string> = {};
  if (outletId) params.outletId = outletId;

  const res = await customerAxios.get("/cart", { params });
  return transformCartResponse(res.data.data);
};

export const addToCart = async (item: CartItem, forceReplace: boolean = false): Promise<Cart> => {
  const payload: Record<string, any> = {
    productId: item.productId,
    quantity: item.quantity,
    forceReplace 
  };

  if (item.outletId) {
    payload.outletId = item.outletId;
  }

  const res = await customerAxios.post("/cart/items", payload);

  if (res.data?.success === false && res.data?.code === "OUTLET_MISMATCH") {
      throw {
          code: "OUTLET_MISMATCH",
          message: res.data.message || "Item from different outlet"
      };
  }

  return transformCartResponse(res.data.data);
};

// ✅ FIXED: outletId is now passed in 'params', not 'body'
export const updateCartItem = async (productId: string, quantity: number, outletId?: string): Promise<Cart> => {
  const payload = { quantity };
  
  // Configuration object for query parameters
  const config = outletId ? { params: { outletId } } : {};

  // Pass payload as body, and config (with params) as the third argument
  const res = await customerAxios.patch(`/cart/items/${productId}`, payload, config);
  return transformCartResponse(res.data.data);
};

// ✅ UPDATED: Now accepts outletId (passed in query params)
export const removeCartItem = async (productId: string, outletId?: string): Promise<Cart> => {
  const config = outletId ? { params: { outletId } } : {};
  const res = await customerAxios.delete(`/cart/items/${productId}`, config);
  
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