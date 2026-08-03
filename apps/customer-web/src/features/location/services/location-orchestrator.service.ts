import { getNearbyOutlets } from "@/features/outlet/api/outlet.api";
import { NearbyOutlet } from "@/features/outlet/outlet.type";
import { buildLocationKey } from "@/features/location/location.types";
import { traceCoordinates } from "@/features/location/utils/coordinate.utils";

const LOOKUP_TIMEOUT_MS = 10_000;

export interface OutletLookupResult {
  locationKey: string;
  outlets: NearbyOutlet[];
  status: "success" | "empty" | "timeout" | "aborted" | "error";
}

interface ActiveLookup {
  key: string;
  generation: number;
  controller: AbortController;
  promise: Promise<OutletLookupResult>;
}

let activeLookup: ActiveLookup | null = null;
let lookupGeneration = 0;

export function getLookupGeneration(): number {
  return lookupGeneration;
}

export function bumpLookupGeneration(): number {
  lookupGeneration += 1;
  return lookupGeneration;
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  controller: AbortController,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error("TIMEOUT"));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export function cancelActiveOutletLookup(): void {
  if (activeLookup) {
    activeLookup.controller.abort();
    activeLookup = null;
  }
}

export function lookupOutletsForLocation(params: {
  latitude: number;
  longitude: number;
  addressLabel?: string;
  generation: number;
}): Promise<OutletLookupResult> {
  const locationKey = buildLocationKey(params.latitude, params.longitude);

  if (
    activeLookup &&
    activeLookup.key === locationKey &&
    activeLookup.generation === params.generation
  ) {
    return activeLookup.promise;
  }

  cancelActiveOutletLookup();

  const controller = new AbortController();

  const promise = (async (): Promise<OutletLookupResult> => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[location-orchestrator] lookup start", {
        generation: params.generation,
        latitude: params.latitude,
        longitude: params.longitude,
        addressLabel: params.addressLabel ?? null,
      });
    }

    try {
      const outlets = await withTimeout(
        getNearbyOutlets(params.latitude, params.longitude, controller.signal),
        LOOKUP_TIMEOUT_MS,
        controller,
      );

      if (activeLookup?.generation !== params.generation) {
        return {
          locationKey,
          outlets: [],
          status: "aborted",
        };
      }

      if (process.env.NODE_ENV !== "production") {
        console.info("[location-orchestrator] lookup success", {
          generation: params.generation,
          latitude: params.latitude,
          longitude: params.longitude,
          outletCount: outlets.length,
          outlets: outlets.map((outlet) => ({
            id: outlet.id,
            name: outlet.name,
            distanceKm: outlet.distanceKm,
          })),
        });
      }

      if (outlets[0]) {
        traceCoordinates({
          stage: "API_REQUEST",
          latitude: params.latitude,
          longitude: params.longitude,
          extra: {
            selectedOutletId: outlets[0].id,
            selectedOutletName: outlets[0].name,
            distanceKm: outlets[0].distanceKm,
          },
        });
      }

      return {
        locationKey,
        outlets,
        status: outlets.length === 0 ? "empty" : "success",
      };
    } catch (error) {
      if (activeLookup?.generation !== params.generation) {
        return {
          locationKey,
          outlets: [],
          status: "aborted",
        };
      }

      if (controller.signal.aborted) {
        const message = error instanceof Error ? error.message : "";
        return {
          locationKey,
          outlets: [],
          status: message === "TIMEOUT" ? "timeout" : "aborted",
        };
      }

      console.error("[location-orchestrator] lookup failed", error);
      return {
        locationKey,
        outlets: [],
        status: "error",
      };
    } finally {
      if (
        activeLookup?.controller === controller &&
        activeLookup.generation === params.generation
      ) {
        activeLookup = null;
      }
    }
  })();

  activeLookup = {
    key: locationKey,
    generation: params.generation,
    controller,
    promise,
  };

  return promise;
}

export function selectDefaultOutlet(
  outlets: NearbyOutlet[],
): {
  outlet: NearbyOutlet | null;
  promptSelection: boolean;
} {
  if (outlets.length === 0) {
    return { outlet: null, promptSelection: false };
  }

  if (outlets.length === 1) {
    return { outlet: outlets[0], promptSelection: false };
  }

  return { outlet: outlets[0], promptSelection: true };
}
