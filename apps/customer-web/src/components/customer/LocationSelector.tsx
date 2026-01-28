"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, Home, Briefcase, Navigation, Settings, LogIn } from "lucide-react";
import { useLiveLocation } from "@/features/location/hooks/useLiveLocation";
import { reverseGeocode } from "@/features/location/utils/reverseGeocode";
import { AddressService, Address } from "@/features/addresses/address.service";
import { useLocationStore } from "@/features/location/location.store"; 
import { useCustomerAuthStore } from "@/features/customer-auth/store/auth.store"; 

export default function LocationSelector() {
  // Local UI State
  const [isOpen, setIsOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Global State & Hooks
  const { latitude, longitude, addressLabel, setLocation } = useLocationStore();
  const { lat: liveLat, lng: liveLng } = useLiveLocation();
  const { isAuthenticated } = useCustomerAuthStore(); 

  // 1. Initial Setup: Use Live Location if nothing is set in store
  useEffect(() => {
    if (!latitude && !longitude && liveLat && liveLng) {
       handleSelectCurrentLocation();
    }
  }, [liveLat, liveLng, latitude, longitude]);

  // 2. Fetch Saved Addresses (ONLY if Logged In)
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      AddressService.getAll()
        .then(data => setSavedAddresses(data.filter(a => !a.isDeleted)))
        .catch(err => console.error(err));
    }
  }, [isOpen, isAuthenticated]); 

  // 3. Close on Outside Click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---

  const handleSelectCurrentLocation = async () => {
    if (liveLat && liveLng) {
      let label = "Current Location";
      try {
        const placeName = await reverseGeocode(liveLat, liveLng);
        if (placeName) {
           const parts = placeName.split(",").map(p => p.trim());
           
           // 1. Filter out 'India' and Pincodes (6 digits) to clean the list
           const cleanParts = parts.filter(p => 
             p !== "India" && !/^\d{6}$/.test(p)
           );

           // Remove duplicates
           const uniqueParts = [...new Set(cleanParts)];
           
           // ✅ FIX: Smart Slicing
           // If address is long (e.g. "Street, Area, City, State"), we skip the first part (Street).
           // We then take the next 2 parts (Area, City).
           if (uniqueParts.length > 3) {
             label = uniqueParts.slice(1, 3).join(", ");
           } else {
             // If short (e.g. "Area, City, State"), just take the first 2.
             label = uniqueParts.slice(0, 2).join(", ");
           }
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
      
      setLocation(liveLat, liveLng, label);
      setIsOpen(false);
    } else {
      alert("Location unavailable. Please check browser permissions.");
    }
  };

  const handleSelectSavedAddress = (addr: Address) => {
    setLocation(addr.latitude, addr.longitude, addr.label);
    setIsOpen(false);
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      
      {/* TRIGGER (Header Display) */}
      <div 
        className="flex items-center gap-2 cursor-pointer group p-1 rounded-lg hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MapPin size={20} className="text-emerald-600 flex-shrink-0" />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-0.5 group-hover:text-emerald-600">
            Deliver to
          </span>
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm text-slate-700 max-w-[260px] truncate leading-none">
              {addressLabel}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-12 left-0 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 origin-top-left">
          
          {/* Option 1: Current Location */}
          <button 
            onClick={handleSelectCurrentLocation}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Navigation size={16} />
            </div>
            <div>
              <div className="font-bold text-emerald-700 text-sm">Use Current Location</div>
              <div className="text-[10px] text-slate-500">Using GPS</div>
            </div>
          </button>

          <div className="h-px bg-slate-100 my-2" />

          {/* Option 2: Saved Addresses */}
          {isAuthenticated ? (
            <>
              <div className="max-h-56 overflow-y-auto custom-scrollbar">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Saved Addresses</div>
                
                {savedAddresses.length > 0 ? savedAddresses.map((addr) => (
                  <button 
                    key={addr.id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left mb-1"
                  >
                    <div className="mt-0.5 text-slate-400">
                      {addr.type === "HOME" ? <Home size={16} /> : addr.type === "WORK" ? <Briefcase size={16} /> : <MapPin size={16} />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-bold text-slate-700 text-sm truncate">{addr.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">{addr.addressText}</div>
                    </div>
                  </button>
                )) : (
                  <div className="text-center py-3 text-xs text-slate-400 italic">No saved addresses found</div>
                )}
              </div>

              <div className="h-px bg-slate-100 my-2" />

              <Link 
                href="/profile/addresses" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full p-2.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Settings size={14} /> Manage Addresses
              </Link>
            </>
          ) : (
            <Link 
              href="/login"
              className="flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-slate-50 hover:bg-emerald-50 text-emerald-700 font-bold text-xs transition-colors"
            >
              <LogIn size={14} /> Sign in to see saved addresses
            </Link>
          )}
        </div>
      )}
    </div>
  );
}