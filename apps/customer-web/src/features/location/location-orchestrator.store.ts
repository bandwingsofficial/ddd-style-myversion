import { create } from "zustand";
import { toast } from "sonner";

import { invalidateProductCatalogCache } from "@/features/products/api/product.api";
import { useCartStore } from "@/features/cart/cart.store";
import { useLocationStore } from "@/features/location/location.store";
import { formatLocationLabel } from "@/features/location/location.types";
import {
  bumpLookupGeneration,
  cancelActiveOutletLookup,
  lookupOutletsForLocation,
  toNearbyOutlet,
} from "@/features/location/services/location-orchestrator.service";
import { reverseGeocode } from "@/features/location/utils/reverseGeocode";
import { requestGpsOnce } from "@/features/location/utils/request-gps";
import {
  assertUsableCoordinates,
  traceCoordinates,
} from "@/features/location/utils/coordinate.utils";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { NearbyOutlet } from "@/features/outlet/outlet.type";

import type { LocationFsmState } from "./location-fsm.types";

interface LocationChangeParams {
  lat: number;
  lng: number;
  label: string;
  formattedAddress?: string;
  source: "gps" | "manual" | "saved";
}

interface LocationOrchestratorStore {
  fsmState: LocationFsmState;
  isRefreshing: boolean;
  showLocationSheet: boolean;
  errorMessage: string | null;
  initialized: boolean;
  activeLookupGeneration: number;
  gpsAbortController: AbortController | null;

  openLocationSheet: () => void;
  closeLocationSheet: () => void;
  cancel: () => void;
  retry: () => void;
  initOnce: () => void;
  onLocationChanged: (params: LocationChangeParams) => Promise<void>;
  useCurrentLocation: () => Promise<void>;
}

let initStarted = false;

async function applyOutletSwitch(nextOutlet: NearbyOutlet | null): Promise<void> {
  const outletStore = useOutletStore.getState();
  const previousOutlet = outletStore.selectedOutlet;
  const cartStore = useCartStore.getState();

  if (!nextOutlet) {
    outletStore.clearOutlet();
    invalidateProductCatalogCache();
    if (cartStore.items.length > 0 || cartStore.cartOutletId) {
      await cartStore.clear();
    }
    return;
  }

  if (previousOutlet?.id !== nextOutlet.id) {
    if (cartStore.items.length > 0 || cartStore.cartOutletId) {
      await cartStore.clear();
      toast.info("Delivery location changed. Your cart was cleared.", {
        description: `Now shopping from ${nextOutlet.name}`,
      });
    }
    invalidateProductCatalogCache();
  }

  outletStore.setOutlet(nextOutlet);
}

export const useLocationOrchestratorStore = create<LocationOrchestratorStore>(
  (set, get) => ({
    fsmState: "IDLE",
    isRefreshing: false,
    showLocationSheet: false,
    errorMessage: null,
    initialized: false,
    activeLookupGeneration: 0,
    gpsAbortController: null,

    openLocationSheet: () => set({ showLocationSheet: true }),

    closeLocationSheet: () => set({ showLocationSheet: false }),

    cancel: () => {
      bumpLookupGeneration();
      cancelActiveOutletLookup();
      get().gpsAbortController?.abort();
      set((state) => ({
        activeLookupGeneration: state.activeLookupGeneration + 1,
        fsmState: "CANCELLED",
        isRefreshing: false,
        showLocationSheet: false,
        gpsAbortController: null,
      }));
    },

    retry: () => {
      const location = useLocationStore.getState();
      if (location.latitude != null && location.longitude != null) {
        void get().onLocationChanged({
          lat: location.latitude,
          lng: location.longitude,
          label: location.addressLabel,
          formattedAddress: location.formattedAddress ?? location.addressLabel,
          source: location.source ?? "manual",
        });
        return;
      }

      initStarted = false;
      set({ fsmState: "IDLE", errorMessage: null, initialized: false });
      get().initOnce();
    },

    initOnce: () => {
      if (initStarted) return;
      initStarted = true;

      const waitForHydration = () => {
        const locationHydrated = useLocationStore.getState().hasHydrated;
        const outletHydrated = useOutletStore.getState().hasHydrated;

        if (!locationHydrated || !outletHydrated) {
          window.setTimeout(waitForHydration, 50);
          return;
        }

        void bootstrapLocationFlow(set, get);
      };

      waitForHydration();
    },

    onLocationChanged: async ({
      lat,
      lng,
      label,
      formattedAddress,
      source,
    }) => {
      const stage =
        source === "gps"
          ? "GPS_RAW"
          : source === "saved"
            ? "SAVED_ADDRESS"
            : "MANUAL_SELECTION";

      assertUsableCoordinates(lat, lng, stage);
      traceCoordinates({
        stage,
        latitude: lat,
        longitude: lng,
        label,
        source,
      });

      const generation = bumpLookupGeneration();
      cancelActiveOutletLookup();

      useLocationStore.getState().setDeliveryAddress({
        lat,
        lng,
        label,
        formattedAddress,
        source,
      });

      if (source === "gps") {
        useLocationStore.getState().setGpsLocation({ lat, lng, label });
      }

      set({
        activeLookupGeneration: generation,
        fsmState: "FINDING_OUTLETS",
        isRefreshing: false,
        errorMessage: null,
        showLocationSheet: false,
      });

      const result = await lookupOutletsForLocation({
        latitude: lat,
        longitude: lng,
        addressLabel: label,
        generation,
      });

      if (generation !== get().activeLookupGeneration) return;

      if (result.status === "aborted") return;

      if (result.status === "timeout") {
        set({
          fsmState: "ERROR",
          isRefreshing: false,
          errorMessage: "Unable to connect. Please try again.",
        });
        return;
      }

      if (result.status === "error") {
        set({
          fsmState: "ERROR",
          isRefreshing: false,
          errorMessage: "Unable to connect. Please try again.",
        });
        return;
      }

      if (result.status === "empty" || !result.resolvedOutlet) {
        await applyOutletSwitch(null);
        set({
          fsmState: "NO_OUTLET",
          isRefreshing: false,
          errorMessage: null,
        });
        return;
      }

      const selectedOutlet = toNearbyOutlet(result.resolvedOutlet);
      await applyOutletSwitch(selectedOutlet);

      if (generation !== get().activeLookupGeneration) return;

      set({
        fsmState: selectedOutlet ? "READY" : "NO_OUTLET",
        isRefreshing: false,
        errorMessage: null,
      });
    },

    useCurrentLocation: async () => {
      set({ fsmState: "LOADING_LOCATION", showLocationSheet: false });

      const gpsController = new AbortController();
      set({ gpsAbortController: gpsController });

      const gps = await requestGpsOnce(gpsController.signal);
      set({ gpsAbortController: null });

      if (!gps.ok) {
        set({ fsmState: "CANCELLED", showLocationSheet: true });
        return;
      }

      let label = "Current Location";
      let formattedAddress = label;

      try {
        const placeName = await reverseGeocode(gps.latitude, gps.longitude);
        if (placeName) {
          label = formatLocationLabel(placeName);
          formattedAddress = placeName;
        }
      } catch {
        // keep defaults
      }

      await get().onLocationChanged({
        lat: gps.latitude,
        lng: gps.longitude,
        label,
        formattedAddress,
        source: "gps",
      });
    },
  }),
);

async function bootstrapLocationFlow(
  set: (
    partial:
      | Partial<LocationOrchestratorStore>
      | ((state: LocationOrchestratorStore) => Partial<LocationOrchestratorStore>),
  ) => void,
  get: () => LocationOrchestratorStore,
) {
  const locationStore = useLocationStore.getState();

  set({ initialized: true });

  if (locationStore.latitude != null && locationStore.longitude != null) {
    await get().onLocationChanged({
      lat: locationStore.latitude,
      lng: locationStore.longitude,
      label: locationStore.addressLabel,
      formattedAddress:
        locationStore.formattedAddress ?? locationStore.addressLabel,
      source: locationStore.source ?? "manual",
    });
    return;
  }

  set({ fsmState: "LOADING_LOCATION" });

  const gpsController = new AbortController();
  set({ gpsAbortController: gpsController });

  const gps = await requestGpsOnce(gpsController.signal);
  set({ gpsAbortController: null });

  if (!gps.ok) {
    set({ fsmState: "CANCELLED", showLocationSheet: true });
    return;
  }

  let label = "Current Location";
  let formattedAddress = label;

  try {
    const placeName = await reverseGeocode(gps.latitude, gps.longitude);
    if (placeName) {
      label = formatLocationLabel(placeName);
      formattedAddress = placeName;
    }
  } catch {
    // keep defaults
  }

  await get().onLocationChanged({
    lat: gps.latitude,
    lng: gps.longitude,
    label,
    formattedAddress,
    source: "gps",
  });
}
