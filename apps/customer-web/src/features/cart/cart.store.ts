import { create } from "zustand";
import { CartItem } from "@/features/cart/cart.types";
import * as cartApi from "@/features/cart/cart.api";
import {
  getLocalCart,
  setLocalCart,
  clearLocalCart,
} from "@/features/cart/cart.local";

interface CartState {
  items: CartItem[];
  hydrated: boolean;

  loadCart: (isLoggedIn: boolean) => Promise<void>;
  addItem: (item: CartItem, isLoggedIn: boolean) => Promise<void>;
  updateItem: (
    productId: string,
    quantity: number,
    isLoggedIn: boolean
  ) => Promise<void>;
  removeItem: (productId: string, isLoggedIn: boolean) => Promise<void>;
  mergeAfterLogin: () => Promise<void>;
  clear: (isLoggedIn: boolean) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hydrated: false,

  /* ======================================================
     LOAD CART (CRITICAL FIX)
  ====================================================== */
  loadCart: async (isLoggedIn) => {
    // ✅ Guest user → NEVER call backend
    if (!isLoggedIn) {
      const local = getLocalCart();
      set({ items: local.items, hydrated: true });
      return;
    }

    // ✅ Logged-in user → backend cart (safe)
    try {
      const backend = await cartApi.fetchCart();
      set({ items: backend?.items || [], hydrated: true });
    } catch (error) {
      console.error("Failed to fetch cart", error);
      // Safety fallback: never break UI
      set({ items: [], hydrated: true });
    }
  },

  /* ======================================================
     ADD ITEM
  ====================================================== */
  addItem: async (item, isLoggedIn) => {
    if (!isLoggedIn) {
      const local = getLocalCart();
      const existing = local.items.find(
        (i: CartItem) => i.productId === item.productId
      );

      if (existing) {
        existing.quantity += item.quantity;
      } else {
        local.items.push(item);
      }

      setLocalCart(local);
      set({ items: local.items });
      return;
    }

    const updated = await cartApi.addToCart(item);
    set({ items: updated.items });
  },

  /* ======================================================
     UPDATE ITEM QUANTITY
  ====================================================== */
  updateItem: async (productId, quantity, isLoggedIn) => {
    if (!isLoggedIn) {
      const local = getLocalCart();
      const item = local.items.find(
        (i: CartItem) => i.productId === productId
      );

      if (item) {
        item.quantity = quantity;
      }

      setLocalCart(local);
      set({ items: local.items });
      return;
    }

    const updated = await cartApi.updateCartItem(productId, quantity);
    set({ items: updated.items });
  },

  /* ======================================================
     REMOVE ITEM
  ====================================================== */
  removeItem: async (productId, isLoggedIn) => {
    if (!isLoggedIn) {
      const local = getLocalCart();
      local.items = local.items.filter(
        (i: CartItem) => i.productId !== productId
      );

      setLocalCart(local);
      set({ items: local.items });
      return;
    }

    const updated = await cartApi.removeCartItem(productId);
    set({ items: updated.items });
  },

  /* ======================================================
     MERGE CART AFTER LOGIN
  ====================================================== */
  mergeAfterLogin: async () => {
    const local = getLocalCart();
    if (!local.items.length) return;

    for (const item of local.items) {
      await cartApi.addToCart(item);
    }

    clearLocalCart();

    try {
      const backend = await cartApi.fetchCart();
      set({ items: backend.items });
    } catch (error) {
      console.error("Failed to fetch cart after merge", error);
      set({ items: [] });
    }
  },

  /* ======================================================
     CLEAR CART
  ====================================================== */
  clear: async (isLoggedIn) => {
    if (!isLoggedIn) {
      clearLocalCart();
      set({ items: [] });
      return;
    }

    await cartApi.clearCart();
    set({ items: [] });
  },
}));
