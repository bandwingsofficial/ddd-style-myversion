"use client";

import { MapPin, Navigation, RefreshCw, Search } from "lucide-react";

import { useLocationOrchestratorStore } from "@/features/location/location-orchestrator.store";

interface NoDeliveryStateProps {
  title?: string;
  description?: string;
}

export default function NoDeliveryState({
  title = "We're not delivering here yet.",
  description = "We couldn't find any nearby outlets for your selected location.",
}: NoDeliveryStateProps) {
  const openLocationSheet = useLocationOrchestratorStore(
    (state) => state.openLocationSheet,
  );
  const retry = useLocationOrchestratorStore((state) => state.retry);

  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl shadow-sm">
        <span aria-hidden>📍</span>
      </div>
      <div className="mb-2 text-3xl" aria-hidden>
        😔
      </div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {description}
      </p>

      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={openLocationSheet}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          <Search size={16} />
          Choose another location
        </button>
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>

      <button
        type="button"
        onClick={openLocationSheet}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
      >
        <Navigation size={14} />
        Use current location
      </button>
    </div>
  );
}

export function ConnectionErrorState({
  message = "Unable to connect.",
}: {
  message?: string;
}) {
  const openLocationSheet = useLocationOrchestratorStore(
    (state) => state.openLocationSheet,
  );
  const retry = useLocationOrchestratorStore((state) => state.retry);

  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed border-amber-200 bg-amber-50/70 px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-amber-600 shadow-sm">
        <MapPin size={28} />
      </div>
      <h3 className="text-xl font-bold text-slate-800">{message}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Check your connection or choose a different delivery location.
      </p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={retry}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          <RefreshCw size={16} />
          Retry
        </button>
        <button
          type="button"
          onClick={openLocationSheet}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Search size={16} />
          Choose location
        </button>
      </div>
    </div>
  );
}
