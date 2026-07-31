"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useSession } from "@/features/customer-auth/hooks/useSession";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";
import { useCartStore } from "@/features/cart/cart.store";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { ProductListItem } from "@/features/products/types/product.types";
import { toast } from "sonner";

/* ======================================================
   1. FAVORITES CONTEXT
====================================================== */

type FavoritesContextType = {
  favorites: ProductListItem[];
  addToFavorites: (product: ProductListItem) => void;
  removeFromFavorites: (productId: string | number) => void;
  isFavorite: (productId: string | number) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

/* ======================================================
   2. FAVORITES PROVIDER
====================================================== */

function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<ProductListItem[]>([]);
  const [userId, setUserId] = useState("guest");

  const STORAGE_KEY = `favorites_${userId}`;

  const { actorId, isAuthenticated } = useCustomerAuthStore();

  useEffect(() => {
    if (isAuthenticated && actorId) {
      setUserId(actorId);
    } else {
      setUserId("guest");
    }
  }, [isAuthenticated, actorId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites, STORAGE_KEY]);

  const addToFavorites = (product: ProductListItem) => {
    setFavorites((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
    toast.success("Added to favorites");
  };

  const removeFromFavorites = (productId: string | number) => {
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
    toast.info("Removed from favorites");
  };

  const isFavorite = (productId: string | number) =>
    favorites.some((p) => p.id === productId);

  return (
    <FavoritesContext.Provider
      value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

/* ======================================================
   3. FAVORITES HOOK
====================================================== */

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within CustomerAuthProvider");
  }
  return context;
}

/* ======================================================
   4. MAIN CUSTOMER AUTH PROVIDER
====================================================== */

export default function CustomerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrateSession = useSession();
  const hasInitialized = useRef(false);
  const lastOutletIdRef = useRef<string | null>(null);

  const sessionChecked = useCustomerAuthStore((s) => s.sessionChecked);
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const selectedOutletId = useOutletStore((s) => s.selectedOutlet?.id ?? null);
  const outletHydrated = useOutletStore((s) => s.hasHydrated);

  const loadCart = useCartStore((s) => s.loadCart);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    void hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (!sessionChecked || !outletHydrated) return;
    loadCart(isAuthenticated);
  }, [sessionChecked, isAuthenticated, outletHydrated, loadCart]);

  useEffect(() => {
    if (!sessionChecked || !outletHydrated || !isAuthenticated || !selectedOutletId) {
      return;
    }

    if (lastOutletIdRef.current === null) {
      lastOutletIdRef.current = selectedOutletId;
      return;
    }

    if (lastOutletIdRef.current === selectedOutletId) return;

    lastOutletIdRef.current = selectedOutletId;
    loadCart(true);
  }, [
    sessionChecked,
    outletHydrated,
    isAuthenticated,
    selectedOutletId,
    loadCart,
  ]);

  return <FavoritesProvider>{children}</FavoritesProvider>;
}
