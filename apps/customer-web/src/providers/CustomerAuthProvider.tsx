"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useSession } from "@/features/customer-auth/hooks/useSession";
import { useCustomerSession } from "@/features/customer-auth/hooks/useCustomerSession";
import { useCartStore } from "@/features/cart/cart.store";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { ProductListItem } from "@/features/products/types/product.types";
import { toast } from "sonner";

type FavoritesContextType = {
  favorites: ProductListItem[];
  addToFavorites: (product: ProductListItem) => void;
  removeFromFavorites: (productId: string | number) => void;
  isFavorite: (productId: string | number) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<ProductListItem[]>([]);
  const [userId, setUserId] = useState("guest");

  const { isLoggedIn, actorId } = useCustomerSession();

  useEffect(() => {
    if (isLoggedIn && actorId) {
      setUserId(actorId);
    } else {
      setUserId("guest");
    }
  }, [isLoggedIn, actorId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(`favorites_${userId}`);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
  }, [favorites, userId]);

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

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within CustomerAuthProvider");
  }
  return context;
}

export default function CustomerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrateSession = useSession();
  const hasInitialized = useRef(false);
  const lastAuthStateRef = useRef<boolean | null>(null);
  const lastOutletIdRef = useRef<string | null>(null);

  const { isReady, isLoggedIn } = useCustomerSession();
  const selectedOutletId = useOutletStore((s) => s.selectedOutlet?.id ?? null);
  const outletHydrated = useOutletStore((s) => s.hasHydrated);

  const loadCart = useCartStore((s) => s.loadCart);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    void hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (!isReady || !outletHydrated) return;
    void loadCart(isLoggedIn);
  }, [isReady, isLoggedIn, outletHydrated, loadCart]);

  useEffect(() => {
    if (!isReady || !outletHydrated) return;

    if (lastAuthStateRef.current === null) {
      lastAuthStateRef.current = isLoggedIn;
      return;
    }

    if (lastAuthStateRef.current !== isLoggedIn) {
      lastAuthStateRef.current = isLoggedIn;
      void loadCart(isLoggedIn);
    }
  }, [isReady, isLoggedIn, outletHydrated, loadCart]);

  useEffect(() => {
    if (!isReady || !outletHydrated || !isLoggedIn || !selectedOutletId) {
      return;
    }

    if (lastOutletIdRef.current === null) {
      lastOutletIdRef.current = selectedOutletId;
      return;
    }

    if (lastOutletIdRef.current === selectedOutletId) return;

    lastOutletIdRef.current = selectedOutletId;
    void loadCart(true);
  }, [isReady, outletHydrated, isLoggedIn, selectedOutletId, loadCart]);

  return <FavoritesProvider>{children}</FavoritesProvider>;
}
