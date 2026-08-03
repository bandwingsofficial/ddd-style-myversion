"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronDown,
  MapPin,
  Home,
  Briefcase,
  Navigation,
  Settings,
  LogIn,
  Search,
} from "lucide-react";
import { AddressService, Address } from "@/features/addresses/address.service";
import { useLocationStore } from "@/features/location/location.store";
import { useLocationOrchestratorStore } from "@/features/location/location-orchestrator.store";
import { useDeliveryAppState } from "@/features/location/hooks/useDeliveryAppState";
import { HeaderLocationShimmer } from "@/components/ui/Shimmer";
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store";

interface LocationSelectorProps {
  variant?: "mobile" | "desktop";
}

export default function LocationSelector({
  variant = "desktop",
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { showShimmer } = useDeliveryAppState();
  const addressLabel = useLocationStore((state) => state.addressLabel);
  const formattedAddress = useLocationStore((state) => state.formattedAddress);
  const openLocationSheet = useLocationOrchestratorStore(
    (state) => state.openLocationSheet,
  );
  const onLocationChanged = useLocationOrchestratorStore(
    (state) => state.onLocationChanged,
  );
  const { isAuthenticated, sessionChecked } = useCustomerAuthStore();

  const locality = addressLabel || "Select Location";
  const secondaryLine =
    formattedAddress && formattedAddress !== addressLabel
      ? formattedAddress
      : null;

  useEffect(() => {
    if (!isOpen || !sessionChecked || !isAuthenticated) {
      if (!isAuthenticated) setSavedAddresses([]);
      return;
    }

    AddressService.getAll()
      .then((data) => setSavedAddresses(data.filter((item) => !item.isDeleted)))
      .catch(() => setSavedAddresses([]));
  }, [isOpen, isAuthenticated, sessionChecked]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSavedAddress = async (address: Address) => {
    setIsOpen(false);
    await onLocationChanged({
      lat: address.latitude,
      lng: address.longitude,
      label: address.label,
      formattedAddress: address.addressText,
      source: "saved",
    });
  };

  if (showShimmer && addressLabel === "Select Location") {
    return <HeaderLocationShimmer />;
  }

  const isMobile = variant === "mobile";

  return (
    <div className={`relative z-50 ${isMobile ? "w-full min-w-0" : ""}`} ref={dropdownRef}>
      <button
        type="button"
        className={`group flex w-full cursor-pointer items-center gap-2 rounded-lg transition-colors hover:bg-slate-50 ${
          isMobile ? "min-w-0 px-1 py-0.5 text-left" : "p-1"
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`Deliver to ${locality}`}
      >
        <MapPin size={isMobile ? 18 : 20} className="shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <span className="mb-0.5 block text-[10px] font-bold uppercase leading-none text-slate-400 group-hover:text-emerald-600">
            Deliver to
          </span>
          <div className="flex min-w-0 items-center gap-1">
            <span
              className={`min-w-0 flex-1 truncate font-bold leading-tight text-slate-700 ${
                isMobile ? "text-sm" : "max-w-[min(18rem,42vw)] text-sm"
              }`}
            >
              {locality}
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
          {secondaryLine && !isMobile && (
            <span className="mt-0.5 block max-w-[min(20rem,46vw)] truncate text-[11px] leading-tight text-slate-500">
              {secondaryLine}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className={`absolute top-[calc(100%+0.35rem)] z-[1100] w-80 max-w-[calc(100vw-1.5rem)] origin-top-left animate-in fade-in slide-in-from-top-2 rounded-xl border border-slate-100 bg-white p-2 shadow-xl ${isMobile ? "left-0" : "left-0"}`}>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              openLocationSheet();
            }}
            className="group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-emerald-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Navigation size={16} />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-700">
                Use Current Location
              </div>
              <div className="text-[10px] text-slate-500">Detect using GPS</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              openLocationSheet();
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Search size={16} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-700">
                Search another location
              </div>
              <div className="text-[10px] text-slate-500">
                Area, street, landmark
              </div>
            </div>
          </button>

          <div className="my-2 h-px bg-slate-100" />

          {isAuthenticated ? (
            <>
              <div className="custom-scrollbar max-h-56 overflow-y-auto">
                <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Saved Addresses
                </div>

                {savedAddresses.length > 0 ? (
                  savedAddresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => void handleSelectSavedAddress(address)}
                      className="mb-1 flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="mt-0.5 text-slate-400">
                        {address.type === "HOME" ? (
                          <Home size={16} />
                        ) : address.type === "WORK" ? (
                          <Briefcase size={16} />
                        ) : (
                          <MapPin size={16} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="truncate text-sm font-bold text-slate-700">
                          {address.label}
                        </div>
                        <div className="truncate text-[10px] text-slate-500">
                          {address.addressText}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-3 text-center text-xs italic text-slate-400">
                    No saved addresses found
                  </div>
                )}
              </div>

              <div className="my-2 h-px bg-slate-100" />

              <Link
                href="/profile/addresses"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-50 p-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100"
              >
                <Settings size={14} /> Manage Addresses
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-50 p-3 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <LogIn size={14} /> Sign in to see saved addresses
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
