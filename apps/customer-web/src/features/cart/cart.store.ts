import { create } from "zustand";
import { CartItem } from "@/features/cart/cart.types";
import * as cartApi from "@/features/cart/cart.api";
import {
  getLocalCart,
  setLocalCart,
  clearLocalCart,
} from "@/features/cart/cart.local";
// ✅ IMPORT OUTLET STORE
import { useOutletStore } from "@/features/outlet/outlet.store";

interface CartState {
  items: CartItem[];
  hydrated: boolean;
  isLoading: boolean;
  isCheckingOut: boolean;
  isMerging: boolean;

  loadCart: (isLoggedIn: boolean) => Promise<void>;
  addItem: (item: CartItem, isLoggedIn: boolean) => Promise<void>;
  updateItem: (productId: string, quantity: number, isLoggedIn: boolean) => Promise<void>;
  removeItem: (productId: string, isLoggedIn: boolean) => Promise<void>;
  clear: (isLoggedIn: boolean) => Promise<void>;
  checkoutCart: (addressId?: string) => Promise<boolean>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hydrated: false,
  isLoading: false,
  isCheckingOut: false,
  isMerging: false,

  loadCart: async (isLoggedIn) => {
    if (get().isLoading || get().isMerging) return;

    set({ isLoading: true });

    if (!isLoggedIn) {
      const local = getLocalCart();
      set({ items: local.items || [], hydrated: true, isLoading: false });
      return;
    }

    try {
      const local = getLocalCart();
      const currentOutletId = useOutletStore.getState().selectedOutlet?.id; // Get ID

      // Sync Logic
      if (local.items && local.items.length > 0) {
        set({ isMerging: true });
        console.log("Syncing guest cart...");

        const itemsToSync = [...local.items];
        clearLocalCart();

        // Pass outletId to clearCart during sync too
        try { await cartApi.clearCart(currentOutletId); } catch (e) { console.warn("Could not clear old cart"); }

        for (const item of itemsToSync) {
          if (!item.outletId) continue;
          try {
            await cartApi.addToCart(item, true); 
          } catch (err) {
            console.error(`Failed to sync item: ${item.productName}`);
          }
        }
        set({ isMerging: false });
      }

      // Fetch
      const backendCart = await cartApi.fetchCart(currentOutletId);
      set({ items: backendCart?.items || [], hydrated: true });

    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        console.warn("Session expired (401). Clearing cart view.");
        set({ items: [], hydrated: true, isMerging: false });
      } else {
        console.error("Failed to load cart", error);
        set({ items: [], hydrated: true, isMerging: false });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (item, isLoggedIn) => {
    if (!isLoggedIn) {
      const local = getLocalCart();
      const firstItem = local.items[0];
      if (firstItem && firstItem.outletId !== item.outletId) {
         if (typeof window !== "undefined" && window.confirm("Your cart has items from another outlet. Clear cart to add this item?")) {
             local.items = [item];
             setLocalCart(local);
             set({ items: local.items });
         }
         return;
      }

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
      const updatedCart = await cartApi.addToCart(item, false);
      set({ items: updatedCart?.items || [] });
    } catch (error: any) {
      const isMismatch = error.code === "OUTLET_MISMATCH" || 
                         (error.response?.data?.code === "OUTLET_MISMATCH");

      if (isMismatch) {
        const shouldReplace = typeof window !== "undefined" && window.confirm("Your cart contains items from another outlet. Would you like to clear your cart and add this item?");
        if (shouldReplace) {
           try {
             const forcedCart = await cartApi.addToCart(item, true);
             set({ items: forcedCart?.items || [] });
           } catch (retryError) {
             console.error("Failed to force add item", retryError);
           }
        }
      } else {
        console.error("Failed to add item", error);
      }
    }
  },

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
      const currentOutletId = useOutletStore.getState().selectedOutlet?.id;
      const updatedCart = await cartApi.updateCartItem(productId, quantity, currentOutletId);
      set({ items: updatedCart?.items || [] });
    } catch (error) {
      console.error("Failed to update item", error);
    }
  },

  removeItem: async (productId, isLoggedIn) => {
    if (!isLoggedIn) {
      const local = getLocalCart();
      local.items = local.items.filter((i: CartItem) => i.productId !== productId);
      setLocalCart(local);
      set({ items: local.items });
      return;
    }
    try {
      const currentOutletId = useOutletStore.getState().selectedOutlet?.id;
      const updatedCart = await cartApi.removeCartItem(productId, currentOutletId);
      set({ items: updatedCart?.items || [] });
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  },

  // 🔥 FIXED: Now passes outletId to the API to fix 400 Error
  clear: async (isLoggedIn) => {
    if (!isLoggedIn) {
      clearLocalCart();
      set({ items: [] });
      return;
    }
    try {
      const currentOutletId = useOutletStore.getState().selectedOutlet?.id;
      await cartApi.clearCart(currentOutletId); // ✅ Added currentOutletId
      set({ items: [] });
    } catch (error) {
      console.error("Failed to clear cart", error);
    }
  },

  checkoutCart: async (addressId) => {
    set({ isCheckingOut: true });
    try {
      // 🔥 UPDATED: Pass outletId to checkout 
      const currentOutletId = useOutletStore.getState().selectedOutlet?.id;
      const lockedCart = await cartApi.checkout(addressId, currentOutletId);
      
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