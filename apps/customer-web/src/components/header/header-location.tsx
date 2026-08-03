"use client";

import { MapPin, ChevronDown } from "lucide-react";
import { useLiveLocation } from "@/features/location/hooks/useLiveLocation";
import { useLocationStore } from "@/features/location/location.store";

export default function HeaderLocation() {
  const location = useLiveLocation();
  const { addressLabel } = useLocationStore();

  return (
    <button className="flex min-w-0 items-center gap-2">
      <MapPin className="h-5 w-5 shrink-0 text-green-600" />

      <div className="min-w-0 flex-1 text-left leading-tight">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Deliver To
        </p>

        <p className="truncate text-sm font-semibold text-slate-900">
          {location.lat === null ? "Detecting location..." : addressLabel}
        </p>
      </div>

      <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
    </button>
  );
}