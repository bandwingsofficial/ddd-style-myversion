"use client";

import { MapPin } from "lucide-react";
import { useLocation } from "@/features/location/use-location";
import { useLocationStore } from "@/features/location/location.store";

export default function HeaderLocation() {
  useLocation();

  const { area, city, loading } = useLocationStore();

  return (
    <button className="flex items-center gap-2 text-sm">
      <MapPin className="h-4 w-4 text-green-600" />

      <div className="flex flex-col text-left leading-tight">
        <span className="text-xs text-muted-foreground">
          Deliver to
        </span>

        <span className="max-w-[140px] truncate font-medium">
          {loading
            ? "Detecting..."
            : `${area}${city ? ", " + city : ""}`}
        </span>
      </div>
    </button>
  );
}
