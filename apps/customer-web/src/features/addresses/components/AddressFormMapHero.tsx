"use client";

import dynamic from "next/dynamic";
import { Loader2, Crosshair } from "lucide-react";

const AddressLocationMapPreview = dynamic(
  () =>
    import("./AddressLocationMapPreview").then(
      (mod) => mod.AddressLocationMapPreview,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center bg-slate-100 text-xs text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
        Loading map...
      </div>
    ),
  },
);

interface AddressFormMapHeroProps {
  visible: boolean;
  latitude: number;
  longitude: number;
  loading?: boolean;
  onLocationChange: (latitude: number, longitude: number) => void;
  onRecenter: () => void;
  recentering?: boolean;
}

export function AddressFormMapHero({
  visible,
  latitude,
  longitude,
  loading = false,
  onLocationChange,
  onRecenter,
  recentering = false,
}: AddressFormMapHeroProps) {
  if (!visible || !latitude || !longitude) {
    return (
      <div className="flex h-[280px] items-center justify-center bg-slate-100">
        {loading ? (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            Detecting your location...
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative">
      <AddressLocationMapPreview
        latitude={latitude}
        longitude={longitude}
        onLocationChange={onLocationChange}
        className="rounded-none border-0"
      />

      <button
        type="button"
        onClick={onRecenter}
        disabled={recentering}
        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
      >
        {recentering ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Crosshair className="h-3.5 w-3.5 text-emerald-600" />
        )}
        Use Current Location
      </button>
    </div>
  );
}
