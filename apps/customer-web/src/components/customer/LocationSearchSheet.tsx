"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  Loader2,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { Address, AddressService } from "@/features/addresses/address.service";
import { useLocationOrchestratorStore } from "@/features/location/location-orchestrator.store";
import { formatLocationLabel } from "@/features/location/location.types";
import { getRecentLocations } from "@/features/location/recent-locations";
import {
  PlaceSuggestion,
  reverseGeocode,
  searchPlaces,
} from "@/features/location/utils/reverseGeocode";
import { requestGpsOnce } from "@/features/location/utils/request-gps";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";

const POPULAR_PLACES = [
  "Malleshwaram, Bengaluru",
  "Yelahanka, Bengaluru",
  "Hebbal, Bengaluru",
  "Indiranagar, Bengaluru",
  "Rajajinagar, Bengaluru",
  "Whitefield, Bengaluru",
];

interface LocationSearchSheetProps {
  open: boolean;
  onClose: () => void;
  onCancel?: () => void;
}

export default function LocationSearchSheet({
  open,
  onClose,
  onCancel,
}: LocationSearchSheetProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [usingGps, setUsingGps] = useState(false);

  const onLocationChanged = useLocationOrchestratorStore(
    (state) => state.onLocationChanged,
  );
  const { isAuthenticated, sessionChecked } = useCustomerAuthStore();

  const recentLocations = useMemo(() => getRecentLocations(), [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSuggestions([]);
      return;
    }

    if (!sessionChecked || !isAuthenticated) {
      setSavedAddresses([]);
      return;
    }

    setLoadingAddresses(true);
    AddressService.getAll()
      .then((data) => setSavedAddresses(data.filter((item) => !item.isDeleted)))
      .catch(() => setSavedAddresses([]))
      .finally(() => setLoadingAddresses(false));
  }, [open, isAuthenticated, sessionChecked]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlaces(query.trim());
        setSuggestions(results);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [open, query]);

  const applyLocation = async (params: {
    lat: number;
    lng: number;
    label: string;
    formattedAddress: string;
    source: "gps" | "manual" | "saved";
  }) => {
    onClose();
    await onLocationChanged(params);
  };

  const handleUseCurrentLocation = async () => {
    setUsingGps(true);
    try {
      const gps = await requestGpsOnce();
      if (!gps.ok) {
        return;
      }

      let label = "Current Location";
      let formattedAddress = label;
      const placeName = await reverseGeocode(gps.latitude, gps.longitude);
      if (placeName) {
        label = formatLocationLabel(placeName);
        formattedAddress = placeName;
      }

      await applyLocation({
        lat: gps.latitude,
        lng: gps.longitude,
        label,
        formattedAddress,
        source: "gps",
      });
    } finally {
      setUsingGps(false);
    }
  };

  const handleSelectSuggestion = async (suggestion: PlaceSuggestion) => {
    await applyLocation({
      lat: suggestion.latitude,
      lng: suggestion.longitude,
      label: formatLocationLabel(suggestion.placeName),
      formattedAddress: suggestion.placeName,
      source: "manual",
    });
  };

  const handleSelectPopular = async (place: string) => {
    setSearching(true);
    try {
      const results = await searchPlaces(place, 1);
      if (results[0]) {
        await handleSelectSuggestion(results[0]);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSavedAddress = async (address: Address) => {
    await applyLocation({
      lat: address.latitude,
      lng: address.longitude,
      label: address.label,
      formattedAddress: address.addressText,
      source: "saved",
    });
  };

  const sheetContent = (
    <div className="space-y-4">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search area, street, landmark..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none ring-emerald-500 transition focus:border-emerald-500 focus:bg-white focus:ring-2"
        />
        {searching && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-emerald-600"
          />
        )}
      </div>

      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={usingGps}
        className="flex w-full items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-left transition hover:bg-emerald-100"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-600">
          {usingGps ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Navigation size={18} />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-700">Use Current Location</p>
          <p className="text-xs text-emerald-600/80">Detect using GPS</p>
        </div>
      </button>

      {suggestions.length > 0 && (
        <Section title="Suggestions">
          {suggestions.map((suggestion) => (
            <LocationRow
              key={suggestion.id}
              icon={<MapPin size={16} className="mt-0.5 text-slate-400" />}
              title={suggestion.label}
              subtitle={suggestion.placeName}
              onClick={() => void handleSelectSuggestion(suggestion)}
            />
          ))}
        </Section>
      )}

      {query.trim().length < 2 && (
        <Section title="Popular nearby places">
          <div className="flex flex-wrap gap-2">
            {POPULAR_PLACES.map((place) => (
              <button
                key={place}
                type="button"
                onClick={() => void handleSelectPopular(place)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                {place.split(",")[0]}
              </button>
            ))}
          </div>
        </Section>
      )}

      {recentLocations.length > 0 && query.trim().length < 2 && (
        <Section title="Recent locations">
          {recentLocations.map((location) => (
            <LocationRow
              key={`${location.latitude}-${location.longitude}`}
              icon={<Clock3 size={16} className="mt-0.5 text-slate-400" />}
              title={location.label}
              subtitle={location.formattedAddress}
              onClick={() =>
                void applyLocation({
                  lat: location.latitude,
                  lng: location.longitude,
                  label: location.label,
                  formattedAddress: location.formattedAddress,
                  source: "manual",
                })
              }
            />
          ))}
        </Section>
      )}

      {sessionChecked && isAuthenticated && (
        <Section title="Saved addresses">
          {loadingAddresses ? (
            <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              Loading addresses...
            </div>
          ) : savedAddresses.length > 0 ? (
            savedAddresses.map((address) => (
              <LocationRow
                key={address.id}
                icon={<MapPin size={16} className="mt-0.5 text-slate-400" />}
                title={address.label}
                subtitle={address.addressText}
                onClick={() => void handleSelectSavedAddress(address)}
              />
            ))
          ) : (
            <p className="py-2 text-xs italic text-slate-400">
              No saved addresses yet.
            </p>
          )}
        </Section>
      )}
    </div>
  );

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="Select delivery location">
        {sheetContent}
      </BottomSheet>

      {open && (
        <div className="fixed inset-0 z-[100001] hidden items-end justify-center bg-black/40 backdrop-blur-[2px] lg:flex">
          <div className="mb-0 flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-bold text-slate-900">
                Select delivery location
              </h2>
              <div className="flex items-center gap-2">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-5 py-4">{sheetContent}</div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      {children}
    </div>
  );
}

function LocationRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50"
    >
      {icon}
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </button>
  );
}
