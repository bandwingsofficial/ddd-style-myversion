import {
  resolveDeliveryOutlet,
  ResolvedDeliveryOutlet,
} from "@/features/outlet/api/outlet.api";
import { NearbyOutlet } from "@/features/outlet/outlet.type";
import { buildLocationKey } from "@/features/location/location.types";
import { traceCoordinates } from "@/features/location/utils/coordinate.utils";

const LOOKUP_TIMEOUT_MS = 10_000;

export interface OutletLookupResult {
  locationKey: string;
  resolvedOutlet: ResolvedDeliveryOutlet | null;
  nearbyOutlets: NearbyOutlet[];
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
      const resolution = await withTimeout(
        resolveDeliveryOutlet(
          params.latitude,
          params.longitude,
          controller.signal,
        ),
        LOOKUP_TIMEOUT_MS,
        controller,
      );

      if (activeLookup?.generation !== params.generation) {
        return {
          locationKey,
          resolvedOutlet: null,
          nearbyOutlets: [],
          status: "aborted",
        };
      }

      const resolvedOutlet = resolution.resolvedOutlet;
      const nearbyOutlets = resolution.nearbyOutlets ?? [];

      if (process.env.NODE_ENV !== "production") {
        console.info("[location-orchestrator] lookup success", {
          generation: params.generation,
          latitude: params.latitude,
          longitude: params.longitude,
          status: resolution.status,
          resolvedOutletId: resolvedOutlet?.outletId ?? null,
          resolvedOutletName: resolvedOutlet?.outletName ?? null,
          outletCount: nearbyOutlets.length,
        });
      }

      if (resolvedOutlet) {
        traceCoordinates({
          stage: "API_REQUEST",
          latitude: params.latitude,
          longitude: params.longitude,
          extra: {
            selectedOutletId: resolvedOutlet.outletId,
            selectedOutletName: resolvedOutlet.outletName,
            distanceKm: resolvedOutlet.distanceKm,
          },
        });
      }

      return {
        locationKey,
        resolvedOutlet,
        nearbyOutlets,
        status:
          resolution.status === "NO_SERVICE" || !resolvedOutlet
            ? "empty"
            : "success",
      };
    } catch (error) {
      if (activeLookup?.generation !== params.generation) {
        return {
          locationKey,
          resolvedOutlet: null,
          nearbyOutlets: [],
          status: "aborted",
        };
      }

      if (controller.signal.aborted) {
        const message = error instanceof Error ? error.message : "";
        return {
          locationKey,
          resolvedOutlet: null,
          nearbyOutlets: [],
          status: message === "TIMEOUT" ? "timeout" : "aborted",
        };
      }

      console.error("[location-orchestrator] lookup failed", error);
      return {
        locationKey,
        resolvedOutlet: null,
        nearbyOutlets: [],
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

export function toNearbyOutlet(
  resolved: ResolvedDeliveryOutlet,
): NearbyOutlet {
  return {
    ...resolved.outlet,
    distanceKm: resolved.distanceKm,
  };
}
