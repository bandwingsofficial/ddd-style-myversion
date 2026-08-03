"use client";

import { MapPin, Navigation, RefreshCw, Search } from "lucide-react";

import { useLocationOrchestratorStore } from "@/features/location/location-orchestrator.store";
import { useDeliveryAppState } from "@/features/location/hooks/useDeliveryAppState";

interface NoDeliveryStateProps {
  title?: string;
  description?: string;
}

export default function NoDeliveryState({
  title,
  description,
}: NoDeliveryStateProps) {
  const openLocationSheet = useLocationOrchestratorStore(
    (state) => state.openLocationSheet,
  );
  const retry = useLocationOrchestratorStore((state) => state.retry);
  const useCurrentLocation = useLocationOrchestratorStore(
    (state) => state.useCurrentLocation,
  );
  const { selectedDeliveryLocation } = useDeliveryAppState();

  const locationName =
    selectedDeliveryLocation.addressLabel &&
    selectedDeliveryLocation.addressLabel !== "Select Location"
      ? selectedDeliveryLocation.addressLabel
      : "this location";

  const resolvedTitle =
    title ?? `Sorry! We don't deliver to ${locationName} yet.`;
  const resolvedDescription =
    description ??
    "Choose another location to see if we deliver in your area.";

  return (
  <div className="col-span-full px-8 py-10 lg:px-12">
    <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center">

      {/* Illustration */}
      <div className="flex h-44 w-44 shrink-0 items-center justify-center rounded-full bg-emerald-50">
        <span className="text-8xl">🏪</span>
      </div>

      {/* Content */}
      <div className="flex-1 text-center lg:text-left">

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {resolvedTitle}
        </h2>

        <p className="mt-3 max-w-2xl text-[16px] leading-7 text-slate-500 lg:mx-0 mx-auto">
          {resolvedDescription}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">

          <button
            type="button"
            onClick={openLocationSheet}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Search size={18} />
            Choose Another Location
          </button>

          <button
            type="button"
            onClick={() => void useCurrentLocation()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <Navigation size={18} />
            Use Current Location
          </button>

          <button
            type="button"
            onClick={retry}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            <RefreshCw size={18} />
            Retry
          </button>

        </div>

      </div>

    </div>
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

export function CheckoutOutOfServiceState({
  message,
  nearbyOutlets,
}: {
  message: string;
  nearbyOutlets?: Array<{ id: string; name: string }>;
}) {
  const openLocationSheet = useLocationOrchestratorStore(
    (state) => state.openLocationSheet,
  );

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
      <div className="mb-4 text-4xl" aria-hidden>
        🏪
      </div>
      <h3 className="text-lg font-bold text-slate-800">{message}</h3>
      <p className="mt-2 text-sm text-slate-600">
        Please choose another delivery address to continue checkout.
      </p>
      {nearbyOutlets && nearbyOutlets.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-100 bg-white p-4 text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Nearby outlets we deliver from
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {nearbyOutlets.map((outlet) => (
              <li key={outlet.id}>• {outlet.name}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={openLocationSheet}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
      >
        <Search size={16} />
        Choose another location
      </button>
    </div>
  );
}
