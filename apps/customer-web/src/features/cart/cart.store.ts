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
  isLoading: boolean;
  
  // ✅ NEW: Checkout Loading State
  isCheckingOut: boolean; 

  loadCart: (isLoggedIn: boolean) => Promise<void>;
  addItem: (item: CartItem, isLoggedIn: boolean) => Promise<void>;
  updateItem: (productId: string, quantity: number, isLoggedIn: boolean) => Promise<void>;
  removeItem: (productId: string, isLoggedIn: boolean) => Promise<void>;
  mergeAfterLogin: () => Promise<void>;
  clear: (isLoggedIn: boolean) => Promise<void>;
  
  // ✅ NEW: Checkout Action
  checkoutCart: () => Promise<boolean>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hydrated: false,
  isLoading: false,
  isCheckingOut: false, // Initial state

  /* ======================================================
      LOAD CART
   ====================================================== */
  loadCart: async (isLoggedIn) => {
    set({ isLoading: true });
    if (!isLoggedIn) {
      const local = getLocalCart();
      set({ items: local.items || [], hydrated: true, isLoading: false });
      return;
    }
    try {
      const backendCart = await cartApi.fetchCart();
      set({ items: backendCart?.items || [], hydrated: true });
    } catch (error) {
      console.error("Failed to fetch cart", error);
      set({ items: [], hydrated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  /* ======================================================
      ADD ITEM
   ====================================================== */
  addItem: async (item, isLoggedIn) => {
    if (!isLoggedIn) {
      const local = getLocalCart();
      const existing = local.items.find((i: CartItem) => i.productId === item.productId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        local.items.push(item);
      }
      setLocalCart(local);
      set({ items: local.items });
      return;
    }
    try {
      const updatedCart = await cartApi.addToCart(item);
      set({ items: updatedCart?.items || [] });
    } catch (error) {
      console.error("Failed to add item", error);
    }
  },

  /* ======================================================
      UPDATE ITEM
   ====================================================== */
  updateItem: async (productId, quantity, isLoggedIn) => {
    if (!isLoggedIn) {
      const local = getLocalCart();
      const item = local.items.find((i: CartItem) => i.productId === productId);
      if (item) {
        item.quantity = quantity;
        setLocalCart(local);
        set({ items: local.items });
      }
      return;
    }
    try {
      const updatedCart = await cartApi.updateCartItem(productId, quantity);
      set({ items: updatedCart?.items || [] });
    } catch (error) {
      console.error("Failed to update item", error);
    }
  },

  /* ======================================================
      REMOVE ITEM
   ====================================================== */
  removeItem: async (productId, isLoggedIn) => {
    if (!isLoggedIn) {
      const local = getLocalCart();
      local.items = local.items.filter((i: CartItem) => i.productId !== productId);
      setLocalCart(local);
      set({ items: local.items });
      return;
    }

    try {
      const updatedCart = await cartApi.removeCartItem(productId);
      set({ items: updatedCart?.items || [] });
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  },

  /* ======================================================
      MERGE & CLEAR
   ====================================================== */
  mergeAfterLogin: async () => {
    const local = getLocalCart();
    if (!local.items || local.items.length === 0) {
      const backendCart = await cartApi.fetchCart();
      set({ items: backendCart?.items || [] });
      return;
    }
    set({ isLoading: true });
    try {
      for (const item of local.items) {
        await cartApi.addToCart(item);
      }
      clearLocalCart();
      const finalCart = await cartApi.fetchCart();
      set({ items: finalCart?.items || [] });
    } catch (error) {
      console.error("Merge failed", error);
    } finally {
      set({ isLoading: false });
    }
  },

  clear: async (isLoggedIn) => {
    if (!isLoggedIn) {
      clearLocalCart();
      set({ items: [] });
      return;
    }
    try {
      await cartApi.clearCart();
      set({ items: [] });
    } catch (error) {
      console.error("Failed to clear cart", error);
    }
  },

  /* ======================================================
      ✅ NEW: CHECKOUT CART
   ====================================================== */
  checkoutCart: async () => {
    set({ isCheckingOut: true });
    try {
      // 1. Call API
      const lockedCart = await cartApi.checkout();
      
      // 2. If status is LOCKED, success!
      if (lockedCart && lockedCart.status === "LOCKED") {
        set({ items: [], isCheckingOut: false }); 
        return true;
      }
      
      // If status isn't locked, something weird happened
      set({ isCheckingOut: false });
      return false;

    } catch (error) {
      console.error("Checkout failed", error);
      set({ isCheckingOut: false });
      return false;
    }
  },
}));