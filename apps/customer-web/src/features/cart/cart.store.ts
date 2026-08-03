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
import { canUseAuthenticatedApis } from "@/features/customer-auth/hooks/useCustomerSession";
import { toast } from "sonner";
import { normalizeCartItemPricing } from "@/lib/cart-pricing";

function normalizeGuestCartItem(item: CartItem): CartItem {
  const pricing = normalizeCartItemPricing({
    unitPrice: item.unitPrice,
    discountPrice: item.discountPrice,
    quantity: item.quantity,
  });
  return {
    ...item,
    unitPrice: pricing.unitPrice,
    discountPrice: pricing.discountPrice,
    quantity: pricing.quantity,
    lineTotal: pricing.lineTotal,
  };
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    message?: string;
    code?: string;
    response?: { data?: { message?: string; code?: string } };
  };
  return (
    err?.response?.data?.message ||
    err?.message ||
    err?.response?.data?.code ||
    err?.code ||
    fallback
  );
}

interface CartState {
  items: CartItem[];
  cartOutletId: string | null;
  summary: CartSummary;
  hydrated: boolean;
  isLoading: boolean;
  isCheckingOut: boolean;
  isMerging: boolean;

  loadCart: (isLoggedIn: boolean) => Promise<void>;
  resetToGuest: () => void;
  refreshGuestSummary: (items: CartItem[]) => Promise<void>;
  applyCartResponse: (cart: Cart) => void;
  addItem: (item: CartItem) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
  checkoutCart: (addressId?: string) => Promise<boolean>;
}

let loadCartGeneration = 0;

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartOutletId: null,
  summary: EMPTY_CART_SUMMARY,
  hydrated: false,
  isLoading: false,
  isCheckingOut: false,
  isMerging: false,

  resetToGuest: () => {
    const local = getLocalCart();
    set({
      items: local.items || [],
      summary: EMPTY_CART_SUMMARY,
      hydrated: true,
      isLoading: false,
      isMerging: false,
      isCheckingOut: false,
    });
    void get().refreshGuestSummary(local.items || []);
  },

  applyCartResponse: (cart) => {
    const cartOutletId = cart.outletId ?? null;
    const items = (cart.items || []).map((item) => ({
      ...item,
      outletId: item.outletId ?? cartOutletId ?? undefined,
    }));

    if (process.env.NODE_ENV !== "production") {
      console.info("[outlet-trace]", {
        stage: "cart.applyCartResponse",
        cartOutletId,
        selectedOutletId: useOutletStore.getState().selectedOutlet?.id ?? null,
        itemCount: items.length,
        at: new Date().toISOString(),
      });
    }

    set({
      items,
      cartOutletId,
      summary: mapApiCartToSummary(cart),
    });
  },

  refreshGuestSummary: async (items) => {
    const summary = await resolveGuestCartSummary(items);
    set({ summary });
  },

  loadCart: async (isLoggedIn) => {
    const generation = ++loadCartGeneration;
    set({ isLoading: true });

    const finish = (partial: Partial<CartState>) => {
      if (generation !== loadCartGeneration) return;
      set({ ...partial, isLoading: false });
    };

    if (!isLoggedIn || !canUseAuthenticatedApis()) {
      const local = getLocalCart();
      const items = local.items || [];
      const summary = await resolveGuestCartSummary(items);
      finish({ items, summary, hydrated: true, isMerging: false });
      return;
    }

    const currentOutletId = useOutletStore.getState().selectedOutlet?.id;
    if (!currentOutletId) {
      const local = getLocalCart();
      finish({
        items: local.items || [],
        hydrated: true,
        isMerging: false,
      });
      return;
    }

    try {
      const local = getLocalCart();

      if (local.items && local.items.length > 0) {
        const hasMismatchedOutlet = local.items.some(
          (item) => item.outletId && item.outletId !== currentOutletId,
        );

        if (hasMismatchedOutlet) {
          clearLocalCart();
        } else if (generation !== loadCartGeneration) {
          return;
        } else {
          set({ isMerging: true });

          for (const item of local.items) {
            const itemToSync = {
              ...item,
              outletId: item.outletId ?? currentOutletId,
            };
            if (!itemToSync.outletId) continue;
            try {
              await cartApi.addToCart(itemToSync, false);
            } catch (err: unknown) {
              const error = err as {
                code?: string;
                response?: { data?: { code?: string } };
              };
              const isMismatch =
                error?.code === "OUTLET_MISMATCH" ||
                error?.response?.data?.code === "OUTLET_MISMATCH";

              if (isMismatch) {
                try {
                  await cartApi.addToCart(itemToSync, true);
                } catch (retryError) {
                  console.error(
                    `Failed to sync item: ${item.productName}`,
                    retryError,
                  );
                }
              } else {
                console.error(`Failed to sync item: ${item.productName}`, err);
              }
            }
          }

          clearLocalCart();
          if (generation !== loadCartGeneration) return;
          set({ isMerging: false });
        }
      }

      const { cart: backendCart, notice } =
        await cartApi.fetchCart(currentOutletId);

      if (generation !== loadCartGeneration) return;

      if (notice) {
        toast.info(notice);
      }

      get().applyCartResponse(backendCart);
      finish({ hydrated: true, isMerging: false });
    } catch (error) {
      console.error("Failed to load authenticated cart", error);

      if (generation !== loadCartGeneration) return;

      const local = getLocalCart();
      finish({
        items: local.items || [],
        hydrated: true,
        isMerging: false,
      });
    }
  },

  addItem: async (item) => {
    const isLoggedIn = canUseAuthenticatedApis();

    if (!isLoggedIn) {
      const local = getLocalCart();
      const firstItem = local.items[0];
      if (firstItem && firstItem.outletId !== item.outletId) {
        toast("Your cart has items from another outlet.", {
          action: {
            label: "Clear & Add",
            onClick: () => {
              const normalized = normalizeGuestCartItem(item);
              local.items = [normalized];
              setLocalCart(local);
              void get().refreshGuestSummary(local.items).then(() => {
                set({ items: local.items });
              });
            },
          },
        });
        return;
      }

      const existing = local.items.find(
        (i: CartItem) => i.productId === item.productId,
      );
      if (existing) {
        existing.quantity += item.quantity;
        Object.assign(existing, normalizeGuestCartItem(existing));
      } else {
        local.items.push(normalizeGuestCartItem(item));
      }
      setLocalCart(local);
      const summary = await resolveGuestCartSummary(local.items);
      set({ items: local.items, summary });
      return;
    }

    if (!item.outletId) {
      toast.error("Please select a delivery outlet first.");
      return;
    }

    try {
      const updatedCart = await cartApi.addToCart(item, false);
      get().applyCartResponse(updatedCart);
    } catch (error: unknown) {
      const err = error as {
        code?: string;
        response?: { data?: { code?: string } };
      };
      const isMismatch =
        err?.code === "OUTLET_MISMATCH" ||
        err?.response?.data?.code === "OUTLET_MISMATCH";

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
                toast.error(getApiErrorMessage(retryError, "Could not update your cart."));
              }
            },
          },
        });
        return;
      }

      console.error("Failed to add item", error);
      toast.error(getApiErrorMessage(error, "Could not add item to cart."));
    }
  },

  updateItem: async (productId, quantity) => {
    const isLoggedIn = canUseAuthenticatedApis();

    if (!isLoggedIn) {
      const local = getLocalCart();
      const cartItem = local.items.find((i: CartItem) => i.productId === productId);
      if (cartItem) {
        cartItem.quantity = quantity;
        setLocalCart(local);
        const summary = await resolveGuestCartSummary(local.items);
        set({ items: local.items, summary });
      }
      return;
    }

    try {
      const currentOutletId = useOutletStore.getState().selectedOutlet?.id;
      const updatedCart = await cartApi.updateCartItem(
        productId,
        quantity,
        currentOutletId,
      );
      get().applyCartResponse(updatedCart);
    } catch (error) {
      console.error("Failed to update item", error);
      toast.error(getApiErrorMessage(error, "Could not update cart item."));
    }
  },

  removeItem: async (productId) => {
    const isLoggedIn = canUseAuthenticatedApis();

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
      const updatedCart = await cartApi.removeCartItem(
        productId,
        currentOutletId,
      );
      get().applyCartResponse(updatedCart);
    } catch (error) {
      console.error("Failed to remove item", error);
      toast.error(getApiErrorMessage(error, "Could not remove cart item."));
    }
  },

  clear: async () => {
    const isLoggedIn = canUseAuthenticatedApis();

    if (!isLoggedIn) {
      clearLocalCart();
      set({ items: [], cartOutletId: null, summary: EMPTY_CART_SUMMARY });
      return;
    }

    try {
      const currentOutletId = useOutletStore.getState().selectedOutlet?.id;
      await cartApi.clearCart(currentOutletId);
      set({ items: [], cartOutletId: null, summary: EMPTY_CART_SUMMARY });
    } catch (error) {
      console.error("Failed to clear cart", error);
      toast.error(getApiErrorMessage(error, "Could not clear cart."));
    }
  },

  checkoutCart: async (addressId) => {
    set({ isCheckingOut: true });
    try {
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
      toast.error(getApiErrorMessage(error, "Checkout failed."));
      set({ isCheckingOut: false });
      return false;
    }
  },
}));

