import { CartItem } from "./cart.types";

const CART_KEY = "guest_cart";

export const getLocalCart = (): { items: CartItem[] } => {
  if (typeof window === "undefined") return { items: [] };
  
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : { items: [] };
  } catch (error) {
    console.error("Error parsing local cart", error);
    return { items: [] };
  }
};

export const setLocalCart = (cart: { items: CartItem[] }) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const clearLocalCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
};