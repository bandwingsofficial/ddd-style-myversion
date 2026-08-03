import { create } from "zustand";
import { persist } from "zustand/middleware";

import { NearbyOutlet, Outlet } from "./outlet.type";

interface OutletStore {
  selectedOutlet: Outlet | null;
  serviceableOutlets: NearbyOutlet[];
  outletManuallySelected: boolean;
  lastResolvedLocationKey: string | null;
  outletRevision: number;
  hasHydrated: boolean;

  setOutlet: (outlet: Outlet | null, manuallySelected?: boolean) => void;
  setServiceableOutlets: (outlets: NearbyOutlet[]) => void;
  setLastResolvedLocationKey: (key: string | null) => void;
  invalidateForLocationChange: () => void;
  clearOutlet: () => void;
  setHydrated: () => void;
}

export const useOutletStore = create<OutletStore>()(
  persist(
    (set, get) => ({
      selectedOutlet: null,
      serviceableOutlets: [],
      outletManuallySelected: false,
      lastResolvedLocationKey: null,
      outletRevision: 0,
      hasHydrated: false,

      setOutlet: (outlet, manuallySelected = false) =>
        set((state) => ({
          selectedOutlet: outlet,
          outletManuallySelected: manuallySelected,
          outletRevision: state.outletRevision + 1,
        })),

      setServiceableOutlets: (outlets) => set({ serviceableOutlets: outlets }),

      setLastResolvedLocationKey: (key) =>
        set({ lastResolvedLocationKey: key }),

      invalidateForLocationChange: () =>
        set((state) => ({
          selectedOutlet: null,
          serviceableOutlets: [],
          outletManuallySelected: false,
          lastResolvedLocationKey: null,
          outletRevision: state.outletRevision + 1,
        })),

      clearOutlet: () =>
        set((state) => ({
          selectedOutlet: null,
          outletManuallySelected: false,
          outletRevision: state.outletRevision + 1,
        })),

      setHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "customer-outlet-storage",
      partialize: (state) => ({
        selectedOutlet: state.selectedOutlet,
        outletManuallySelected: state.outletManuallySelected,
        lastResolvedLocationKey: state.lastResolvedLocationKey,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
