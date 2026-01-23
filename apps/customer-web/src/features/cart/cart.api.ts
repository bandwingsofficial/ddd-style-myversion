import customerAxios from "@/http/axios/customerAxios";
import { CartItem } from "./cart.types";

export const fetchCart = async () => {
  const res = await customerAxios.get("/cart");
  return res.data.data;
};

export const addToCart = async (item: CartItem) => {
  const res = await customerAxios.post("/cart/items", item);
  return res.data.data;
};

export const updateCartItem = async (productId: string, quantity: number) => {
  const res = await customerAxios.post(`/cart/items/${productId}`, { quantity });
  return res.data.data;
};

export const removeCartItem = async (productId: string) => {
  const res = await customerAxios.post(`/cart/items/${productId}/remove`);
  return res.data.data;
};

export const clearCart = async () => {
  await customerAxios.post("/cart/clear");
};
