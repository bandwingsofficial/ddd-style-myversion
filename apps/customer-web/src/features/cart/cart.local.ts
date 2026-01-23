const CART_KEY = "guest_cart";

export const getLocalCart = () => {
  if (typeof window === "undefined") return { items: [] };
  return JSON.parse(localStorage.getItem(CART_KEY) || '{"items":[]}');
};

export const setLocalCart = (cart: any) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const clearLocalCart = () => {
  localStorage.removeItem(CART_KEY);
};
