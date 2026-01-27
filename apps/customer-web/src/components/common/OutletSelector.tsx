"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getPublicOutlets } from "@/features/outlet/api/outlet.api";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { Outlet } from "@/features/outlet/outlet.type";
import { MapPin, Loader2, Navigation, Ban, XCircle } from "lucide-react";
import { useLiveLocation } from "@/features/location/hooks/useLiveLocation";

// --- Helper: Haversine Formula (Distance in KM) ---
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const MAX_RADIUS_KM = 6;

export default function OutletSelector() {
  const { selectedOutlet, setOutlet } = useOutletStore();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  // ✅ NEW: Track if user dismissed the modal so it doesn't pop up again immediately
  const [isDismissed, setIsDismissed] = useState(false);
  
  const { lat: userLat, lng: userLng, error: locError } = useLiveLocation();

  // 1. Fetch Outlets
  useEffect(() => {
    getPublicOutlets()
      .then((data) => setOutlets(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // 2. Filter Outlets
  const nearbyOutlets = useMemo(() => {
    if (!userLat || !userLng || outlets.length === 0) return [];

    return outlets
      .map((outlet) => {
        if (!outlet.location?.latitude || !outlet.location?.longitude) {
            return { ...outlet, distance: Infinity };
        }
        const dist = calculateDistance(
          userLat, userLng, 
          outlet.location.latitude, outlet.location.longitude
        );
        return { ...outlet, distance: dist };
      })
      .filter((item) => item.distance <= MAX_RADIUS_KM)
      .sort((a, b) => a.distance - b.distance);
  }, [outlets, userLat, userLng]);

  // 3. Auto-Selection Logic
  useEffect(() => {
    if (loading || !userLat || isDismissed) return;

    if (nearbyOutlets.length > 0) {
      // ✅ FIX: Explicitly type 'nearest' to avoid "type never" error
      const nearest: Outlet & { distance: number } = nearbyOutlets[0];
      
      if (!selectedOutlet || selectedOutlet.id !== nearest.id) {
        setOutlet(nearest);
        setIsOpen(false); 
      }
    } else {
      // No outlets nearby
      if (selectedOutlet) setOutlet(null); 
      setIsOpen(true);
    }
  }, [nearbyOutlets, loading, userLat, setOutlet, selectedOutlet, isDismissed]);

  // Force open if no outlet is selected (unless loading or dismissed)
  useEffect(() => {
    if (!selectedOutlet && !loading && !isDismissed) {
      setIsOpen(true);
    }
  }, [selectedOutlet, loading, isDismissed]);

  if (!isOpen) return null; 

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
        
        {/* Close Button (Optional: mainly for browsing mode) */}
        <button 
            onClick={() => { setIsOpen(false); setIsDismissed(true); }}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
        >
            <XCircle size={24} />
        </button>

        {/* Header */}
        <div className={`p-6 text-white text-center transition-colors ${nearbyOutlets.length === 0 && !loading ? 'bg-red-500' : 'bg-emerald-600'}`}>
          {nearbyOutlets.length === 0 && !loading ? (
             <Ban className="w-12 h-12 mx-auto mb-3 opacity-90" />
          ) : (
             <MapPin className="w-12 h-12 mx-auto mb-3 opacity-90" />
          )}
          
          <h2 className="text-xl font-bold">
            {nearbyOutlets.length === 0 && !loading ? "Out of Service Area" : "Select Your Branch"}
          </h2>
          <p className="text-white/90 text-sm mt-1">
            {nearbyOutlets.length === 0 && !loading 
              ? `We do not deliver to your location yet (${MAX_RADIUS_KM}km limit).` 
              : "Choose the nearest outlet to see menu"}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading || (!userLat && !locError) ? (
            <div className="flex flex-col items-center justify-center py-8 text-emerald-600 gap-3">
              <Loader2 className="animate-spin w-8 h-8"/>
              <p className="text-sm text-slate-500 font-medium">Locating nearest store...</p>
            </div>
          ) : nearbyOutlets.length === 0 ? (
            // --- NO OUTLETS FOUND ---
            <div className="text-center py-6 px-4">
               <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-4">
                 Sorry, we couldn't find any open outlets within <strong>{MAX_RADIUS_KM}km</strong> of your current location.
               </div>
               
               {/* ✅ NEW: Browse Mode Button */}
               <button 
                 onClick={() => {
                    setIsOpen(false);
                    setIsDismissed(true); // Prevents modal from reopening automatically
                 }}
                 className="w-full py-3 border border-slate-300 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition"
               >
                 I just want to browse
               </button>
            </div>
          ) : (
            // --- LIST OF OUTLETS ---
            <div className="space-y-3">
              {nearbyOutlets.map((outlet) => (
                <button
                  key={outlet.id}
                  onClick={() => {
                    setOutlet(outlet);
                    setIsOpen(false);
                  }}
                  disabled={outlet.workingState?.status === "CLOSED"}
                  className={`w-full text-left p-4 rounded-xl border transition-all hover:border-emerald-500 hover:bg-emerald-50 group flex justify-between items-center ${outlet.workingState?.status === "CLOSED" ? "opacity-60 grayscale cursor-not-allowed bg-slate-50" : "bg-white border-slate-200"}`}
                >
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-emerald-700">{outlet.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>{outlet.branch}</span>
                        <span className="flex items-center gap-0.5 text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            <Navigation size={10} /> {outlet.distance.toFixed(1)} km
                        </span>
                    </div>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded ${outlet.workingState?.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {outlet.workingState?.status}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}