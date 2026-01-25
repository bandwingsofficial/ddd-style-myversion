"use client";

import React, { useEffect, useState } from "react";
import { getPublicOutlets } from "@/features/outlet/api/outlet.api";
import { useOutletStore } from "@/features/outlet/outlet.store";
import { Outlet } from "@/features/outlet/outlet.type";
import { MapPin, Loader2 } from "lucide-react";

export default function OutletSelector() {
  const { selectedOutlet, setOutlet } = useOutletStore();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch available outlets on mount
    getPublicOutlets()
      .then((data) => {
        setOutlets(data);
        // OPTIONAL: Auto-select the first one if none selected
        if (!selectedOutlet && data.length > 0) {
           // setOutlet(data[0]); 
           setIsOpen(true); // Or open modal to force user to choose
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Use this to toggle modal if no outlet is selected
  useEffect(() => {
    if (!selectedOutlet && !loading) {
      setIsOpen(true);
    }
  }, [selectedOutlet, loading]);

  if (!isOpen && selectedOutlet) return null; // Don't show if selected (unless you want a change button)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="bg-emerald-600 p-6 text-white text-center">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h2 className="text-xl font-bold">Select Your Branch</h2>
          <p className="text-emerald-100 text-sm mt-1">Choose the nearest outlet to see menu</p>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
             <div className="flex justify-center py-8 text-emerald-600"><Loader2 className="animate-spin"/></div>
          ) : (
            <div className="space-y-3">
              {outlets.map((outlet) => (
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
                    <p className="text-sm text-slate-500">{outlet.branch}</p>
                  </div>
                  <div className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">
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