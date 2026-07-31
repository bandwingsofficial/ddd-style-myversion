import { create } from 'zustand';

import { OutletsApi } from './api/outlets.api';
import { Outlet, WorkingStatus } from './types/outlet.types';
import { getOutletStreamUrl } from './utils/outlet-validation';

interface OutletState {
  outlets: Outlet[];
  loading: boolean;
  error: string | null;

  fetchOutlets: () => Promise<void>;
  updateWorkingStatus: (id: string, status: WorkingStatus) => Promise<void>;
  toggleCamera: (outlet: Outlet) => Promise<void>;
  toggleOutletStatus: (outlet: Outlet) => Promise<void>;
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
      const data = await OutletsApi.list();
      set({
        outlets: Array.isArray(data) ? data : [],
        error: null,
      });
    } catch {
      set({
        outlets: [],
        error: 'Failed to load outlets',
      });
    } finally {
      set({ loading: false });
    }
  },

  updateWorkingStatus: async (id, status) => {
    await OutletsApi.updateWorkingStatus(id, status);
    await get().fetchOutlets();
  },

  toggleCamera: async (outlet) => {
    if (outlet.cameraState?.status === 'ON') {
      await OutletsApi.cameraOff(outlet.id);
    } else {
      const streamUrl = getOutletStreamUrl(outlet);

      if (!streamUrl) {
        throw new Error('Camera stream URL is not configured for this outlet.');
      }

      await OutletsApi.cameraOn(outlet.id, streamUrl);
    }

    await get().fetchOutlets();
  },

  toggleOutletStatus: async (outlet) => {
    if (outlet.status === 'ACTIVE') {
      await OutletsApi.disable(outlet.id);
    } else {
      await OutletsApi.enable(outlet.id);
    }

    await get().fetchOutlets();
  },

  fetchOutletById: async (outletId: string) => {
    const existing = get().outlets.find((outlet) => outlet.id === outletId);
    if (existing) {
      return existing;
    }

    try {
      const outlet = await OutletsApi.getById(outletId);

      if (outlet) {
        set({ outlets: [...get().outlets, outlet] });
        return outlet;
      }

      return null;
    } catch {
      return null;
    }
  },

  getOutletById: (outletId: string) => {
    return get().outlets.find((outlet) => outlet.id === outletId);
  },

  refresh: async () => {
    await get().fetchOutlets();
  },
}));
