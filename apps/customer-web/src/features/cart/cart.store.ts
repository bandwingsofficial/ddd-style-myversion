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
  isCheckingOut: boolean;

  loadCart: (isLoggedIn: boolean) => Promise<void>;
  addItem: (item: CartItem, isLoggedIn: boolean) => Promise<void>;
  updateItem: (productId: string, quantity: number, isLoggedIn: boolean) => Promise<void>;
  removeItem: (productId: string, isLoggedIn: boolean) => Promise<void>;
  mergeAfterLogin: () => Promise<void>;
  clear: (isLoggedIn: boolean) => Promise<void>;
  checkoutCart: () => Promise<boolean>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hydrated: false,
  isLoading: false,
  isCheckingOut: false,

  /* ======================================================
      LOAD CART (DB or Local)
   ====================================================== */
  loadCart: async (isLoggedIn) => {
    set({ isLoading: true });
    
    // 1. Guest -> Load Local
    if (!isLoggedIn) {
      const local = getLocalCart();
      set({ items: local.items || [], hydrated: true, isLoading: false });
      return;
    }

    // 2. Auth -> Load API
    try {
      const backendCart = await cartApi.fetchCart();
      // Use optional chaining (?.) safety
      set({ items: backendCart?.items || [], hydrated: true });
    } catch (error) {
      console.error("Failed to fetch cart", error);
      set({ items: [], hydrated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  /* ======================================================
      ADD ITEM (DB or Local)
   ====================================================== */
  addItem: async (item, isLoggedIn) => {
    // 1. Guest -> Save Local
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

    // 2. Auth -> Save API
    try {
      const updatedCart = await cartApi.addToCart(item);
      set({ items: updatedCart?.items || [] });
    } catch (error) {
      console.error("Failed to add item", error);
    }
  },

  /* ======================================================
      UPDATE ITEM (DB or Local)
   ====================================================== */
  updateItem: async (productId, quantity, isLoggedIn) => {
    // 1. Guest -> Update Local
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

    // 2. Auth -> Update API
    try {
      const updatedCart = await cartApi.updateCartItem(productId, quantity);
      set({ items: updatedCart?.items || [] });
    } catch (error) {
      console.error("Failed to update item", error);
    }
  },

  /* ======================================================
      REMOVE ITEM (DB or Local)
   ====================================================== */
  removeItem: async (productId, isLoggedIn) => {
    // 1. Guest -> Remove Local
    if (!isLoggedIn) {
      const local = getLocalCart();
      local.items = local.items.filter((i: CartItem) => i.productId !== productId);
      setLocalCart(local);
      set({ items: local.items });
      return;
    }

    // 2. Auth -> Remove API
    try {
      const updatedCart = await cartApi.removeCartItem(productId);
      set({ items: updatedCart?.items || [] });
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  },

  /* ======================================================
      MERGE AFTER LOGIN
      (Moves Guest Items -> Backend)
   ====================================================== */
  mergeAfterLogin: async () => {
    const local = getLocalCart();
    
    // If no local items, just fetch fresh backend cart
    if (!local.items || local.items.length === 0) {
      const backendCart = await cartApi.fetchCart();
      set({ items: backendCart?.items || [] });
      return;
    }

    set({ isLoading: true });
    try {
      // Push each local item to backend
      for (const item of local.items) {
        await cartApi.addToCart(item);
      }
      
      // Cleanup local
      clearLocalCart();
      
      // Get final merged state
      const finalCart = await cartApi.fetchCart();
      set({ items: finalCart?.items || [] });
    } catch (error) {
      console.error("Merge failed", error);
    } finally {
      set({ isLoading: false });
    }
  },

  /* ======================================================
      CLEAR
   ====================================================== */
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
      CHECKOUT
   ====================================================== */
  checkoutCart: async () => {
    set({ isCheckingOut: true });
    try {
      const lockedCart = await cartApi.checkout();
      
      if (lockedCart && lockedCart.status === "LOCKED") {
        set({ items: [], isCheckingOut: false }); 
        return true;
      }
      
      set({ isCheckingOut: false });
      return false;
    } catch (error) {
      console.error("Checkout failed", error);
      set({ isCheckingOut: false });
      return false;
    }
  },
}));