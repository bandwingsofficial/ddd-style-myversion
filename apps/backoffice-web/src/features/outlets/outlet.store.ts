import { create } from "zustand";
import { OutletService } from "./outlet.service";
import { Outlet, WorkingStatus } from "./type";

interface OutletState {
  outlets: Outlet[];
  loading: boolean;
  error: string | null;

  fetchOutlets: () => Promise<void>;

  // 🔹 ADDED (work-mode actions)
  updateWorkingStatus: (id: string, status: WorkingStatus) => Promise<void>;
  toggleCamera: (outlet: Outlet) => Promise<void>;
  toggleOutletStatus: (outlet: Outlet) => Promise<void>;

  // 🔹 ADDED (non-breaking helpers)
  fetchOutletById: (outletId: string) => Promise<Outlet | null>;
  getOutletById: (outletId: string) => Outlet | undefined;
  refresh: () => Promise<void>;
}

export const useOutletStore = create<OutletState>((set, get) => ({
  outlets: [],
  loading: false,
  error: null,

  fetchOutlets: async () => {
    set({ loading: true, error: null });

    try {
      const data = await OutletService.getAll();
      set({
        outlets: Array.isArray(data) ? data : [],
        error: null,
      });
    } catch (err) {
      console.error("FETCH OUTLETS FAILED", err);
      set({
        outlets: [],
        error: "Failed to load outlets",
      });
    } finally {
      set({ loading: false });
    }
  },

  // ✅ WORKING STATUS (already working, now centralized)
  updateWorkingStatus: async (id, status) => {
    await OutletService.updateWorkingStatus(id, status);
    await get().fetchOutlets();
  },

  // ✅ CAMERA ON / OFF (real backend logic)
  toggleCamera: async (outlet) => {
    if (outlet.cameraState.status === "ON") {
      await OutletService.cameraOff(outlet.id);
    } else {
      await OutletService.cameraOn(
        outlet.id,
        "rtsp://192.168.1.100/live"
      );
    }
    await get().fetchOutlets();
  },

  // ✅ OUTLET ENABLE / DISABLE
  toggleOutletStatus: async (outlet) => {
    if (outlet.status === "ACTIVE") {
      await OutletService.disable(outlet.id);
    } else {
      await OutletService.enable(outlet.id);
    }
    await get().fetchOutlets();
  },

  // 🔹 NEW: Fetch single outlet safely (no breaking change)
  fetchOutletById: async (outletId: string) => {
    const existing = get().outlets.find(o => o.id === outletId);
    if (existing) return existing;

    try {
      const res = await OutletService.getAll(); // backend has GET /outlets/:id, but this is safe fallback
      const found = Array.isArray(res)
        ? res.find((o: Outlet) => o.id === outletId)
        : null;

      if (found) {
        set({ outlets: [...get().outlets, found] });
        return found;
      }
      return null;
    } catch {
      return null;
    }
  },

  // 🔹 NEW: Selector helper (used in pages)
  getOutletById: (outletId: string) => {
    return get().outlets.find(o => o.id === outletId);
  },

  // 🔹 NEW: Semantic alias (optional)
  refresh: async () => {
    await get().fetchOutlets();
  },
}));
