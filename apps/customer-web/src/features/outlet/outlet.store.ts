import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Outlet } from "./outlet.type";

interface OutletStore {
  selectedOutlet: Outlet | null;
  // ✅ FIX: Allow 'null' so we can safely clear the selection
  setOutlet: (outlet: Outlet | null) => void; 
  clearOutlet: () => void;
}

export const useOutletStore = create<OutletStore>()(
  persist(
    (set) => ({
      selectedOutlet: null,
      setOutlet: (outlet) => set({ selectedOutlet: outlet }),
      clearOutlet: () => set({ selectedOutlet: null }),
    }),
    {
      name: "customer-outlet-storage", // Unique name for localStorage
    }
  )
);