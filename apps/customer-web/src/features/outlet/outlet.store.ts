import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Outlet } from "./outlet.type";

interface OutletStore {
  selectedOutlet: Outlet | null;
  outletRevision: number;
  hasHydrated: boolean;

  setOutlet: (outlet: Outlet | null) => void;
  clearOutlet: () => void;
  setHydrated: () => void;
}

export const useOutletStore = create<OutletStore>()(
  persist(
    (set) => ({
      selectedOutlet: null,
      outletRevision: 0,
      hasHydrated: false,

      setOutlet: (outlet) =>
        set((state) => ({
          selectedOutlet: outlet,
          outletRevision: state.outletRevision + 1,
        })),

      clearOutlet: () =>
        set((state) => ({
          selectedOutlet: null,
          outletRevision: state.outletRevision + 1,
        })),

      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "customer-outlet-storage",
      partialize: (state) => ({
        selectedOutlet: state.selectedOutlet,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
