import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { CustomerLocation, LocationSource } from "./location.types";
import { addRecentLocation } from "./recent-locations";
import {
  assertUsableCoordinates,
  traceCoordinates,
} from "./utils/coordinate.utils";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  addressLabel: string;
  formattedAddress: string | null;
  source: LocationSource | null;
  updatedAt: number | null;
  locationRevision: number;
  hasHydrated: boolean;

  setLocation: (params: {
    lat: number;
    lng: number;
    label: string;
    formattedAddress?: string;
    source: LocationSource;
  }) => void;
  clearLocation: () => void;
  setHydrated: () => void;
  getSnapshot: () => CustomerLocation | null;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      latitude: null,
      longitude: null,
      addressLabel: "Select Location",
      formattedAddress: null,
      source: null,
      updatedAt: null,
      locationRevision: 0,
      hasHydrated: false,

      setLocation: ({ lat, lng, label, formattedAddress, source }) => {
        assertUsableCoordinates(lat, lng, "LOCATION_STORE");

        const resolvedFormattedAddress = formattedAddress ?? label;

        traceCoordinates({
          stage: "LOCATION_STORE",
          latitude: lat,
          longitude: lng,
          label,
          source,
        });

        set((state) => ({
          latitude: lat,
          longitude: lng,
          addressLabel: label,
          formattedAddress: resolvedFormattedAddress,
          source,
          updatedAt: Date.now(),
          locationRevision: state.locationRevision + 1,
        }));

        addRecentLocation({
          latitude: lat,
          longitude: lng,
          label,
          formattedAddress: resolvedFormattedAddress,
        });
      },

      clearLocation: () =>
        set((state) => ({
          latitude: null,
          longitude: null,
          addressLabel: "Select Location",
          formattedAddress: null,
          source: null,
          updatedAt: null,
          locationRevision: state.locationRevision + 1,
        })),

      setHydrated: () => set({ hasHydrated: true }),

      getSnapshot: () => {
        const state = get();
        if (state.latitude == null || state.longitude == null) {
          return null;
        }

        return {
          latitude: state.latitude,
          longitude: state.longitude,
          addressLabel: state.addressLabel,
          formattedAddress: state.formattedAddress ?? state.addressLabel,
          source: state.source ?? "manual",
          updatedAt: state.updatedAt ?? Date.now(),
        };
      },
    }),
    {
      name: "customer-location-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
