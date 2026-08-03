import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type {
  DeliveryAddress,
  GpsLocation,
  LocationSource,
} from "./location.types";
import { addRecentLocation } from "./recent-locations";
import {
  assertUsableCoordinates,
  traceCoordinates,
} from "./utils/coordinate.utils";

interface LocationState {
  /** Delivery address coordinates ("Deliver to"). */
  latitude: number | null;
  longitude: number | null;
  addressLabel: string;
  formattedAddress: string | null;
  source: LocationSource | null;
  updatedAt: number | null;

  /** Latest device GPS fix — does not affect catalog or serviceability. */
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  gpsLabel: string | null;
  gpsUpdatedAt: number | null;

  locationRevision: number;
  hasHydrated: boolean;

  setDeliveryAddress: (params: {
    lat: number;
    lng: number;
    label: string;
    formattedAddress?: string;
    source: LocationSource;
  }) => void;
  setGpsLocation: (params: {
    lat: number;
    lng: number;
    label?: string;
  }) => void;
  /** @deprecated Use setDeliveryAddress */
  setLocation: (params: {
    lat: number;
    lng: number;
    label: string;
    formattedAddress?: string;
    source: LocationSource;
  }) => void;
  clearLocation: () => void;
  setHydrated: () => void;
  getDeliveryAddress: () => DeliveryAddress | null;
  getGpsLocation: () => GpsLocation | null;
  /** @deprecated Use getDeliveryAddress */
  getSnapshot: () => DeliveryAddress | null;
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
      gpsLatitude: null,
      gpsLongitude: null,
      gpsLabel: null,
      gpsUpdatedAt: null,
      locationRevision: 0,
      hasHydrated: false,

      setDeliveryAddress: ({ lat, lng, label, formattedAddress, source }) => {
        assertUsableCoordinates(lat, lng, "LOCATION_STORE");

        const resolvedFormattedAddress = formattedAddress ?? label;

        traceCoordinates({
          stage: "LOCATION_STORE",
          latitude: lat,
          longitude: lng,
          label,
          source,
          extra: { kind: "delivery_address" },
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

      setGpsLocation: ({ lat, lng, label }) => {
        assertUsableCoordinates(lat, lng, "GPS_RAW");

        traceCoordinates({
          stage: "GPS_RAW",
          latitude: lat,
          longitude: lng,
          label: label ?? null,
          source: "gps",
          extra: { kind: "gps_only" },
        });

        set({
          gpsLatitude: lat,
          gpsLongitude: lng,
          gpsLabel: label ?? "Current Location",
          gpsUpdatedAt: Date.now(),
        });
      },

      setLocation: (params) => {
        get().setDeliveryAddress(params);
      },

      clearLocation: () =>
        set((state) => ({
          latitude: null,
          longitude: null,
          addressLabel: "Select Location",
          formattedAddress: null,
          source: null,
          updatedAt: null,
          gpsLatitude: null,
          gpsLongitude: null,
          gpsLabel: null,
          gpsUpdatedAt: null,
          locationRevision: state.locationRevision + 1,
        })),

      setHydrated: () => set({ hasHydrated: true }),

      getDeliveryAddress: () => {
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

      getGpsLocation: () => {
        const state = get();
        if (state.gpsLatitude == null || state.gpsLongitude == null) {
          return null;
        }

        return {
          latitude: state.gpsLatitude,
          longitude: state.gpsLongitude,
          label: state.gpsLabel ?? "Current Location",
          updatedAt: state.gpsUpdatedAt ?? Date.now(),
        };
      },

      getSnapshot: () => get().getDeliveryAddress(),
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
