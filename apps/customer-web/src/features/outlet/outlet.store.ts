import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Outlet } from "../outlet/outlet.type";

interface OutletStore {
  selectedOutlet: Outlet | null;
  setOutlet: (outlet: Outlet) => void;
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
      name: "customer-outlet-storage", // unique name for localStorage
    }
  )
);