"use client";

import { useLocationOrchestratorStore } from "@/features/location/location-orchestrator.store";
import { shouldShowContentShimmer } from "@/features/location/location-fsm.types";
import { useLocationStore } from "@/features/location/location.store";
import { useOutletStore } from "@/features/outlet/outlet.store";

export function useDeliveryAppState() {
  const fsmState = useLocationOrchestratorStore((state) => state.fsmState);
  const isRefreshing = useLocationOrchestratorStore(
    (state) => state.isRefreshing,
  );
  const errorMessage = useLocationOrchestratorStore(
    (state) => state.errorMessage,
  );

  const locationHydrated = useLocationStore((state) => state.hasHydrated);
  const addressLabel = useLocationStore((state) => state.addressLabel);
  const formattedAddress = useLocationStore((state) => state.formattedAddress);
  const deliveryLatitude = useLocationStore((state) => state.latitude);
  const deliveryLongitude = useLocationStore((state) => state.longitude);
  const locationRevision = useLocationStore((state) => state.locationRevision);

  const outletHydrated = useOutletStore((state) => state.hasHydrated);
  const selectedOutlet = useOutletStore((state) => state.selectedOutlet);

  const storesHydrated = locationHydrated && outletHydrated;
  const isResolving =
    fsmState === "LOADING_LOCATION" || fsmState === "FINDING_OUTLETS";

  const showShimmer =
    !storesHydrated || shouldShowContentShimmer(fsmState) || isResolving;

  const isReady = fsmState === "READY" && !!selectedOutlet;
  const isNoOutlet = fsmState === "NO_OUTLET";
  const needsLocation = fsmState === "CANCELLED";
  const isError = fsmState === "ERROR";

  return {
    fsmState,
    storesHydrated,
    showShimmer,
    isRefreshing,
    isReady,
    isNoOutlet,
    needsLocation,
    isError,
    isResolving,
    errorMessage,
    selectedOutlet,
    selectedDeliveryLocation: {
      addressLabel,
      formattedAddress: formattedAddress ?? addressLabel,
      latitude: deliveryLatitude,
      longitude: deliveryLongitude,
      locationRevision,
    },
  };
}
