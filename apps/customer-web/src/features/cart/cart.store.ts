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
  isMerging: boolean; // ✅ Added flag to prevent double merging

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

  /* ======================================================
      LOAD CART (Fixes Double Merging Issue)
     ====================================================== */
  loadCart: async (isLoggedIn) => {
    // Prevent multiple calls from running at the same time
    if (get().isLoading || get().isMerging) return; 

    set({ isLoading: true });
    
    // 1. Guest -> Load from Local Storage
    if (!isLoggedIn) {
      const local = getLocalCart();
      set({ items: local.items || [], hydrated: true, isLoading: false });
      return;
    }

    // 2. Auth -> Sync Logic
    try {
      const local = getLocalCart();
      
      // ✅ Check if there are guest items to sync
      if (local.items && local.items.length > 0) {
        set({ isMerging: true }); // Lock the process
        console.log("Syncing guest cart...");

        // ⚡ CRITICAL FIX: Save items to memory, then DELETE from Local Storage IMMEDIATELY.
        // This prevents a second function call from finding them and duplicating the merge.
        const itemsToSync = [...local.items];
        clearLocalCart(); 

        // Step A: Clear backend cart (Override rule)
        try {
            await cartApi.clearCart(); 
        } catch (e) {
            console.warn("Could not clear old cart, proceeding...");
        }

        // Step B: Upload the items we saved in memory
        for (const item of itemsToSync) {
           // Skip bad items to prevent crashes
           if (!item.outletId) continue; 

           try {
             await cartApi.addToCart(item);
           } catch (err) {
             console.error(`Failed to sync item: ${item.productName}`);
           }
        }
        
        set({ isMerging: false }); // Unlock
      }

      // 3. Fetch final authoritative state from backend
      const backendCart = await cartApi.fetchCart();
      set({ items: backendCart?.items || [], hydrated: true });

    } catch (error) {
      console.error("Failed to load cart", error);
      set({ items: [], hydrated: true, isMerging: false });
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
  checkoutCart: async (addressId) => {
    set({ isCheckingOut: true });
    try {
      const lockedCart = await cartApi.checkout(addressId);
      
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