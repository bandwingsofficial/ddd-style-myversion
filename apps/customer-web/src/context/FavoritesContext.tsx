"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ProductListItem } from "@/features/products/types/product.types";
import { toast } from "sonner"; // Optional: For nice alerts

type FavoritesContextType = {
  favorites: ProductListItem[];
  addToFavorites: (product: ProductListItem) => void;
  removeFromFavorites: (productId: string | number) => void;
  isFavorite: (productId: string | number) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<ProductListItem[]>([]);
  
  // --- USER IDENTIFICATION ---
  // In a real app, this comes from your Auth Context.
  // For now, we simulate a logged-in user ID.
  // CHANGE THIS 'userId' dynamically based on who is logged in!
  const userId = "user_123"; 
  const STORAGE_KEY = `favorites_${userId}`;

  // 1. Load from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setFavorites(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse favorites", e);
        }
      }
    }
  }, [userId]);

  // 2. Save to LocalStorage whenever favorites change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites, userId]);

  // --- ACTIONS ---

  const addToFavorites = (product: ProductListItem) => {
    setFavorites((prev) => {
      // Prevent duplicates
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
    toast.success("Added to favorites");
  };

  const removeFromFavorites = (productId: string | number) => {
    setFavorites((prev) => prev.filter((p) => p.id !== productId));
    toast.info("Removed from favorites");
  };

  const isFavorite = (productId: string | number) => {
    return favorites.some((p) => p.id === productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Custom Hook for easy access
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}