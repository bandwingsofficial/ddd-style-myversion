"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  MapPin,
  Navigation,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { useLocationOrchestratorStore } from "@/features/location/location-orchestrator.store";
import { useLocationStore } from "@/features/location/location.store";
import { estimateDeliveryMinutes } from "@/features/location/services/outlet-resolution.service";
import { useOutletStore } from "@/features/outlet/outlet.store";
import {
  getOutletStatusLabel,
  isOutletOpen,
  NearbyOutlet,
} from "@/features/outlet/outlet.type";
import {
  fetchDeliveryConfig,
  previewDeliveryCharge,
} from "@/features/delivery/delivery.api";

interface OutletCardMeta {
  minimumOrderAmount: number;
  deliveryFee: number;
}

export default function OutletPickerSheet() {
  const showOutletPicker = useLocationOrchestratorStore(
    (state) => state.showOutletPicker,
  );
  const closeOutletPicker = useLocationOrchestratorStore(
    (state) => state.closeOutletPicker,
  );
  const onOutletPicked = useLocationOrchestratorStore(
    (state) => state.onOutletPicked,
  );

  const serviceableOutlets = useOutletStore((state) => state.serviceableOutlets);
  const selectedOutlet = useOutletStore((state) => state.selectedOutlet);
  const addressLabel = useLocationStore((state) => state.addressLabel);

  const [outletMeta, setOutletMeta] = useState<Record<string, OutletCardMeta>>(
    {},
  );

  const sortedOutlets = useMemo(
    () => [...serviceableOutlets],
    [serviceableOutlets],
  );

  useEffect(() => {
    if (!showOutletPicker || sortedOutlets.length === 0) return;

    let cancelled = false;

    const loadMeta = async () => {
      try {
        const [config, preview] = await Promise.all([
          fetchDeliveryConfig(),
          previewDeliveryCharge({ subtotal: 0, netSubtotal: 0 }),
        ]);

        if (cancelled) return;

        const minimumOrderAmount =
          preview.minimumOrderAmount ??
          config?.rules?.[0]?.minimumOrderAmount ??
          0;
        const deliveryFee = preview.deliveryFee ?? 0;

        const nextMeta: Record<string, OutletCardMeta> = {};
        for (const outlet of sortedOutlets) {
          nextMeta[outlet.id] = { minimumOrderAmount, deliveryFee };
        }
        setOutletMeta(nextMeta);
      } catch {
        if (!cancelled) setOutletMeta({});
      }
    };

    void loadMeta();
    return () => {
      cancelled = true;
    };
  }, [showOutletPicker, sortedOutlets]);

  if (!showOutletPicker || sortedOutlets.length <= 1) {
    return null;
  }

  const handleSelectOutlet = (outlet: NearbyOutlet) => {
    void onOutletPicked(outlet);
  };

  const sheetBody = (
    <div className="space-y-4 pb-2">
      <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <p className="font-semibold">Choose your outlet</p>
        <p className="mt-1 text-emerald-700/80">
          Delivering to {addressLabel || "your location"}
        </p>
      </div>

      <div className="space-y-3">
        {sortedOutlets.map((outlet) => {
          const meta = outletMeta[outlet.id];
          const statusLabel = getOutletStatusLabel(outlet);
          const isSelected = selectedOutlet?.id === outlet.id;

          return (
            <button
              key={outlet.id}
              type="button"
              onClick={() => handleSelectOutlet(outlet)}
              disabled={!isOutletOpen(outlet)}
              className={`flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
              } ${!isOutletOpen(outlet) ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800">{outlet.name}</h3>
                  {outlet.branch && (
                    <p className="text-sm text-slate-500">{outlet.branch}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    isOutletOpen(outlet)
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Navigation size={14} className="text-emerald-600" />
                  <span>{outlet.distanceKm.toFixed(1)} km</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock3 size={14} className="text-emerald-600" />
                  <span>{estimateDeliveryMinutes(outlet.distanceKm)} min</span>
                </div>
                {meta && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag size={14} className="text-emerald-600" />
                      <span>Min ₹{meta.minimumOrderAmount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck size={14} className="text-emerald-600" />
                      <span>
                        {meta.deliveryFee <= 0
                          ? "Free delivery"
                          : `Delivery ₹${meta.deliveryFee}`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedOutlet && (
        <button
          type="button"
          onClick={closeOutletPicker}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Continue with {selectedOutlet.name}
        </button>
      )}
    </div>
  );

  return (
    <>
      <BottomSheet
        open={showOutletPicker}
        onClose={closeOutletPicker}
        title="Choose your outlet"
      >
        {sheetBody}
      </BottomSheet>

      <div className="pointer-events-none fixed inset-0 z-[100000] hidden lg:block">
        {showOutletPicker && (
          <div className="pointer-events-auto absolute inset-0 flex items-end justify-center bg-black/40 p-4 backdrop-blur-[2px]">
            <div className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-emerald-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    Choose your outlet
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeOutletPicker}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="max-h-[calc(85vh-4rem)] overflow-y-auto px-5 py-4">
                {sheetBody}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
