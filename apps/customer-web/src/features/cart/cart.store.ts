import { create } from "zustand";
import { CartItem, Cart, CartSummary } from "@/features/cart/cart.types";
import * as cartApi from "@/features/cart/cart.api";
import {
  EMPTY_CART_SUMMARY,
  mapApiCartToSummary,
  resolveGuestCartSummary,
} from "@/features/cart/cart-summary.utils";
import {
  getLocalCart,
  setLocalCart,
  clearLocalCart,
} from "@/features/cart/cart.local";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { toast } from "sonner";

interface CartState {
  items: CartItem[];
  summary: CartSummary;
  hydrated: boolean;
  isLoading: boolean;
  isCheckingOut: boolean;
  isMerging: boolean;

  loadCart: (isLoggedIn: boolean) => Promise<void>;
  refreshGuestSummary: (items: CartItem[]) => Promise<void>;
  applyCartResponse: (cart: Cart) => void;
  addItem: (item: CartItem, isLoggedIn: boolean) => Promise<void>;
  updateItem: (productId: string, quantity: number, isLoggedIn: boolean) => Promise<void>;
  removeItem: (productId: string, isLoggedIn: boolean) => Promise<void>;
  clear: (isLoggedIn: boolean) => Promise<void>;
  checkoutCart: (addressId?: string) => Promise<boolean>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  summary: EMPTY_CART_SUMMARY,
  hydrated: false,
  isLoading: false,
  isCheckingOut: false,
  isMerging: false,

  applyCartResponse: (cart) => {
    set({
      items: cart.items || [],
      summary: mapApiCartToSummary(cart),
    });
  },

  refreshGuestSummary: async (items) => {
    const summary = await resolveGuestCartSummary(items);
    set({ summary });
  },

  loadCart: async (isLoggedIn) => {
    if (get().isLoading || get().isMerging) return;

    set({ isLoading: true });

    if (!isLoggedIn) {
      const local = getLocalCart();
      const items = local.items || [];
      const summary = await resolveGuestCartSummary(items);
      set({ items, summary, hydrated: true, isLoading: false });
      return;
    }

    const currentOutletId = useOutletStore.getState().selectedOutlet?.id;
    if (!currentOutletId) {
      const local = getLocalCart();
      set({
        items: local.items || [],
        hydrated: true,
        isLoading: false,
      });
      return;
    }

    try {
      const local = getLocalCart();

      // Sync Logic
      if (local.items && local.items.length > 0) {
        set({ isMerging: true });

        const itemsToSync = [...local.items];

        for (const item of itemsToSync) {
          if (!item.outletId) continue;
          try {
            await cartApi.addToCart(item, false);
          } catch (err: any) {
            const isMismatch =
              err?.code === "OUTLET_MISMATCH" ||
              err?.response?.data?.code === "OUTLET_MISMATCH";

            if (isMismatch) {
              try {
                await cartApi.addToCart(item, true);
              } catch (retryError) {
                console.error(`Failed to sync item: ${item.productName}`, retryError);
              }
            } else {
              console.error(`Failed to sync item: ${item.productName}`, err);
            }
          }
        }

        clearLocalCart();
        set({ isMerging: false });
      }

      // Fetch
      const { cart: backendCart, notice } = await cartApi.fetchCart(currentOutletId);
      if (notice) {
        toast.info(notice);
      }
      get().applyCartResponse(backendCart);
      set({ hydrated: true });

    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        console.warn(`Cart auth failed (${status}). Falling back to guest cart.`);
        useCustomerAuthStore.getState().clearSession();
        const local = getLocalCart();
        set({
          items: local.items || [],
          hydrated: true,
          isMerging: false,
        });
      } else {
        console.error("Failed to load cart", error);
        const local = getLocalCart();
        set({
          items: local.items || [],
          hydrated: true,
          isMerging: false,
        });
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
         toast("Your cart has items from another outlet.", {
           action: {
             label: "Clear & Add",
             onClick: () => {
               local.items = [item];
               setLocalCart(local);
               void get().refreshGuestSummary(local.items).then(() => {
                 set({ items: local.items });
               });
             },
           },
         });
         return;
      }

      const existing = local.items.find((i: CartItem) => i.productId === item.productId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        local.items.push(item);
      }
      setLocalCart(local);
      const summary = await resolveGuestCartSummary(local.items);
      set({ items: local.items, summary });
      return;
    }

    try {
      const updatedCart = await cartApi.addToCart(item, false);
      get().applyCartResponse(updatedCart);
    } catch (error: any) {
      const isMismatch = error.code === "OUTLET_MISMATCH" || 
                         (error.response?.data?.code === "OUTLET_MISMATCH");

      if (isMismatch) {
        toast("Your cart contains items from another outlet.", {
          action: {
            label: "Clear & Add",
            onClick: async () => {
              try {
                const forcedCart = await cartApi.addToCart(item, true);
                get().applyCartResponse(forcedCart);
              } catch (retryError) {
                console.error("Failed to force add item", retryError);
                toast.error("Could not update your cart.");
              }
            },
          },
        });
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
        const summary = await resolveGuestCartSummary(local.items);
        set({ items: local.items, summary });
      }
      return;
    }
    try {
      const currentOutletId = useOutletStore.getState().selectedOutlet?.id;
      const updatedCart = await cartApi.updateCartItem(productId, quantity, currentOutletId);
      get().applyCartResponse(updatedCart);
    } catch (error) {
      console.error("Failed to update item", error);
    }
  },

  removeItem: async (productId, isLoggedIn) => {
    if (!isLoggedIn) {
      const local = getLocalCart();
      local.items = local.items.filter((i: CartItem) => i.productId !== productId);
      setLocalCart(local);
      const summary = await resolveGuestCartSummary(local.items);
      set({ items: local.items, summary });
      return;
    }
    try {
      const currentOutletId = useOutletStore.getState().selectedOutlet?.id;
      const updatedCart = await cartApi.removeCartItem(productId, currentOutletId);
      get().applyCartResponse(updatedCart);
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  },

  // 🔥 FIXED: Now passes outletId to the API to fix 400 Error
  clear: async (isLoggedIn) => {
    if (!isLoggedIn) {
      clearLocalCart();
      set({ items: [], summary: EMPTY_CART_SUMMARY });
      return;
    }
    try {
      const currentOutletId = useOutletStore.getState().selectedOutlet?.id;
      await cartApi.clearCart(currentOutletId);
      set({ items: [], summary: EMPTY_CART_SUMMARY });
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
        set({ items: [], summary: EMPTY_CART_SUMMARY, isCheckingOut: false });
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