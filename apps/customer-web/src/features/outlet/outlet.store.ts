import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Outlet } from "./outlet.type";

interface OutletStore {
  selectedOutlet: Outlet | null;
  hasHydrated: boolean;
  setOutlet: (outlet: Outlet | null) => void;
  clearOutlet: () => void;
  setHydrated: () => void;
}

export const useOutletStore = create<OutletStore>()(
  persist(
    (set) => ({
      selectedOutlet: null,
      hasHydrated: false,
      setOutlet: (outlet) => set({ selectedOutlet: outlet }),
      clearOutlet: () => set({ selectedOutlet: null }),
      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "customer-outlet-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);