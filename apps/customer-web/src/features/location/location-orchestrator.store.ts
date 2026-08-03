import { create } from "zustand";



import { invalidateProductCatalogCache } from "@/features/products/api/product.api";

import { useCartStore } from "@/features/cart/cart.store";

import { useLocationStore } from "@/features/location/location.store";

import { formatLocationLabel } from "@/features/location/location.types";

import {

  bumpLookupGeneration,

  cancelActiveOutletLookup,

  lookupOutletsForLocation,

  selectDefaultOutlet,

} from "@/features/location/services/location-orchestrator.service";

import { reverseGeocode } from "@/features/location/utils/reverseGeocode";

import { requestGpsOnce } from "@/features/location/utils/request-gps";
import {
  assertUsableCoordinates,
  traceCoordinates,
} from "@/features/location/utils/coordinate.utils";

import { useOutletStore } from "@/features/outlet/outlet.store";

import { NearbyOutlet } from "@/features/outlet/outlet.type";

import { toast } from "sonner";



import type { LocationFsmState } from "./location-fsm.types";



interface LocationChangeParams {

  lat: number;

  lng: number;

  label: string;

  formattedAddress?: string;

  source: "gps" | "manual" | "saved";

  background?: boolean;

}



interface LocationOrchestratorStore {

  fsmState: LocationFsmState;

  isRefreshing: boolean;

  showLocationSheet: boolean;

  showOutletPicker: boolean;

  errorMessage: string | null;

  initialized: boolean;

  activeLookupGeneration: number;

  gpsAbortController: AbortController | null;



  openLocationSheet: () => void;

  closeLocationSheet: () => void;

  openOutletPicker: () => void;

  closeOutletPicker: () => void;

  cancel: () => void;

  retry: () => void;

  initOnce: () => void;

  onLocationChanged: (params: LocationChangeParams) => Promise<void>;

  onOutletPicked: (outlet: NearbyOutlet) => Promise<void>;

}



let initStarted = false;



function invalidateStaleOutletContext(): void {

  useOutletStore.getState().invalidateForLocationChange();

  invalidateProductCatalogCache();

}



async function handleOutletSwitch(nextOutlet: NearbyOutlet): Promise<void> {

  const outletStore = useOutletStore.getState();

  const previousOutlet = outletStore.selectedOutlet;

  const cartStore = useCartStore.getState();

  if (previousOutlet && previousOutlet.id !== nextOutlet.id) {

    const cartOutletId =

      cartStore.items.length > 0 ? cartStore.items[0]?.outletId : null;



    if (cartOutletId) {

      await cartStore.clear();

      toast.info(

        "Outlet changed. Your cart belongs to another outlet and was cleared.",

        { description: `Now shopping from ${nextOutlet.name}` },

      );

    }

  }



  outletStore.setOutlet(nextOutlet, false);

}



async function applyLookupResult(params: {

  generation: number;

  result: Awaited<ReturnType<typeof lookupOutletsForLocation>>;

  label: string;

  background: boolean;

  set: (

    partial:

      | Partial<LocationOrchestratorStore>

      | ((state: LocationOrchestratorStore) => Partial<LocationOrchestratorStore>),

  ) => void;

}): Promise<boolean> {

  const { generation, result, label, background, set } = params;

  const store = useLocationOrchestratorStore.getState();



  if (generation !== store.activeLookupGeneration) {

    return false;

  }



  if (result.status === "aborted") {

    return false;

  }



  if (result.status === "timeout") {

    set({

      fsmState: "ERROR",

      isRefreshing: false,

      errorMessage: "Unable to connect. Please try again.",

      showOutletPicker: false,

    });

    return true;

  }



  if (result.status === "error") {

    set({

      fsmState: "ERROR",

      isRefreshing: false,

      errorMessage: "Something went wrong. Please try again.",

      showOutletPicker: false,

    });

    return true;

  }



  const outletStore = useOutletStore.getState();

  outletStore.setServiceableOutlets(result.outlets);

  outletStore.setLastResolvedLocationKey(result.locationKey);



  if (result.status === "empty") {

    outletStore.clearOutlet();

    set({

      fsmState: "NO_OUTLET",

      isRefreshing: false,

      showOutletPicker: false,

      showLocationSheet: false,

      errorMessage: null,

    });

    return true;

  }



  const selection = selectDefaultOutlet(result.outlets);



  if (selection.outlet) {

    await handleOutletSwitch(selection.outlet);

  }



  if (generation !== useLocationOrchestratorStore.getState().activeLookupGeneration) {

    return false;

  }



  set({

    fsmState: "READY",

    isRefreshing: false,

    showOutletPicker: selection.promptSelection,

    errorMessage: null,

  });



  if (process.env.NODE_ENV !== "production") {

    console.info("[location-orchestrator] resolved", {

      generation,

      label,

      background,

      outletId: selection.outlet?.id ?? null,

      outletName: selection.outlet?.name ?? null,

      promptSelection: selection.promptSelection,

    });

  }



  return true;

}



export const useLocationOrchestratorStore = create<LocationOrchestratorStore>(

  (set, get) => ({

    fsmState: "IDLE",

    isRefreshing: false,

    showLocationSheet: false,

    showOutletPicker: false,

    errorMessage: null,

    initialized: false,

    activeLookupGeneration: 0,

    gpsAbortController: null,



    openLocationSheet: () =>

      set({ showLocationSheet: true, showOutletPicker: false }),



    closeLocationSheet: () => set({ showLocationSheet: false }),



    openOutletPicker: () => set({ showOutletPicker: true }),



    closeOutletPicker: () => set({ showOutletPicker: false }),



    cancel: () => {

      bumpLookupGeneration();

      cancelActiveOutletLookup();

      get().gpsAbortController?.abort();

      set((state) => ({

        activeLookupGeneration: state.activeLookupGeneration + 1,

        fsmState: "CANCELLED",

        isRefreshing: false,

        showLocationSheet: false,

        showOutletPicker: false,

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

      set({

        fsmState: "IDLE",

        errorMessage: null,

        initialized: false,

      });

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

      background = false,

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

        extra: { background },

      });



      const generation = bumpLookupGeneration();

      cancelActiveOutletLookup();



      useLocationStore.getState().setLocation({

        lat,

        lng,

        label,

        formattedAddress,

        source,

      });



      if (!background) {

        invalidateStaleOutletContext();

      }



      set({

        activeLookupGeneration: generation,

        fsmState: background ? get().fsmState : "FINDING_OUTLETS",

        isRefreshing: background,

        errorMessage: null,

        showOutletPicker: false,

      });



      const result = await lookupOutletsForLocation({

        latitude: lat,

        longitude: lng,

        addressLabel: label,

        generation,

      });



      await applyLookupResult({

        generation,

        result,

        label,

        background,

        set,

      });

    },



    onOutletPicked: async (outlet) => {

      await handleOutletSwitch(outlet);

      useOutletStore.getState().setOutlet(outlet, true);

      set({ fsmState: "READY", showOutletPicker: false });

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

  const outletStore = useOutletStore.getState();



  set({ initialized: true });



  if (locationStore.latitude != null && locationStore.longitude != null) {

    traceCoordinates({

      stage: "BOOTSTRAP_RESTORE",

      latitude: locationStore.latitude,

      longitude: locationStore.longitude,

      label: locationStore.addressLabel,

      source: locationStore.source,

    });



    if (outletStore.selectedOutlet) {

      set({ fsmState: "READY" });

      await get().onLocationChanged({

        lat: locationStore.latitude,

        lng: locationStore.longitude,

        label: locationStore.addressLabel,

        formattedAddress:

          locationStore.formattedAddress ?? locationStore.addressLabel,

        source: locationStore.source ?? "manual",

        background: true,

      });

      return;

    }



    set({ fsmState: "FINDING_OUTLETS" });

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

    set({

      fsmState: "CANCELLED",

      showLocationSheet: true,

    });

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



  set({ fsmState: "FINDING_OUTLETS" });

  await get().onLocationChanged({

    lat: gps.latitude,

    lng: gps.longitude,

    label,

    formattedAddress,

    source: "gps",

  });

}


