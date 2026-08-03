"use client";

import { useLocationOrchestrator } from "@/features/location/hooks/useLocationOrchestrator";
import LocationSearchSheet from "@/components/customer/LocationSearchSheet";
import OutletPickerSheet from "@/components/location/OutletPickerSheet";
import { useLocationOrchestratorStore } from "@/features/location/location-orchestrator.store";

export default function LocationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useLocationOrchestrator();

  const showLocationSheet = useLocationOrchestratorStore(
    (state) => state.showLocationSheet,
  );
  const closeLocationSheet = useLocationOrchestratorStore(
    (state) => state.closeLocationSheet,
  );
  const cancel = useLocationOrchestratorStore((state) => state.cancel);

  return (
    <>
      {children}
      <LocationSearchSheet
        open={showLocationSheet}
        onClose={closeLocationSheet}
        onCancel={cancel}
      />
      <OutletPickerSheet />
    </>
  );
}
