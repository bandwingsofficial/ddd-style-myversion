"use client";

import { useEffect } from "react";

import { useLocationOrchestratorStore } from "@/features/location/location-orchestrator.store";

export function useLocationOrchestrator() {
  const initOnce = useLocationOrchestratorStore((state) => state.initOnce);

  useEffect(() => {
    initOnce();
  }, [initOnce]);
}
