import customerAxios from "@/http/axios/customerAxios";
import { Cart } from "./cart.types";
import { mapApiCartToSummary } from "./cart-summary.utils";

const transformCartResponse = (data: any): Cart => {
  if (!data) return { items: [] };

  return {
    ...data,
    subtotal: Number(data.subtotal || 0),
    discount: Number(data.discount || 0),
    afterDiscountTotal: Number(data.afterDiscountTotal || 0),
    deliveryFee: Number(data.deliveryFee || 0),
    grandTotal: Number(data.grandTotal || 0),
    itemCount: Number(data.itemCount || 0),
    isFreeDelivery: Number(data.deliveryFee || 0) === 0,
    amountToFreeDelivery:
      data.amountToFreeDelivery != null
        ? Number(data.amountToFreeDelivery)
        : null,
    items: (data.items || []).map((item: any) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      discountPrice: Number(item.discountPrice),
      quantity: Number(item.quantity),
      lineTotal: item.lineTotal != null ? Number(item.lineTotal) : undefined,
    })),
  };
};

export const fetchCart = async (
  outletId?: string,
): Promise<{ cart: Cart; notice?: string }> => {
  const params: Record<string, string> = {};
  if (outletId) params.outletId = outletId;

  const res = await customerAxios.get("/cart", { params });

  return {
    cart: transformCartResponse(res.data.data),
    notice:
      res.data?.code === "CART_ITEMS_REMOVED"
        ? (res.data.message as string | undefined)
        : undefined,
  };
};

export { mapApiCartToSummary, transformCartResponse };

export const addToCart = async (item: any, forceReplace: boolean = false): Promise<Cart> => {
  const payload: Record<string, any> = {
    productId: item.productId,
    quantity: item.quantity,
    forceReplace,
  };

  if (item.outletId) {
    payload.outletId = item.outletId;
  }

  const res = await customerAxios.post("/cart/items", payload);

  if (res.data?.success === false && res.data?.code === "OUTLET_MISMATCH") {
    throw {
      code: "OUTLET_MISMATCH",
      message: res.data.message || "Item from different outlet",
    };
  }

  return transformCartResponse(res.data.data);
};

export const updateCartItem = async (
  productId: string,
  quantity: number,
  outletId?: string,
): Promise<Cart> => {
  const payload = { quantity };
  const config = outletId ? { params: { outletId } } : {};
  const res = await customerAxios.patch(`/cart/items/${productId}`, payload, config);
  return transformCartResponse(res.data.data);
};

export const removeCartItem = async (
  productId: string,
  outletId?: string,
): Promise<Cart> => {
  const config = outletId ? { params: { outletId } } : {};
  const res = await customerAxios.delete(`/cart/items/${productId}`, config);

  if (!res.data.data) {
    return { items: [] };
  }
  return transformCartResponse(res.data.data);
};

export const clearCart = async (outletId?: string): Promise<void> => {
  const config = outletId ? { params: { outletId } } : {};
  await customerAxios.delete("/cart", config);
};

export const checkout = async (
  addressId?: string,
  outletId?: string,
): Promise<Cart> => {
  const params = outletId ? { outletId } : {};
  const payload = addressId ? { addressId } : {};
  const res = await customerAxios.post("/cart/checkout", payload, { params });
  return transformCartResponse(res.data.data);
};
