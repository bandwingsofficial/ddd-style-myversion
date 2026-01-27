import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationState {
  // The coordinates currently used to calculate delivery availability
  latitude: number | null;
  longitude: number | null;
  addressLabel: string; // e.g. "Home" or "Current Location"
  
  setLocation: (lat: number, lng: number, label: string) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      addressLabel: "Select Location",

      setLocation: (lat, lng, label) => set({ latitude: lat, longitude: lng, addressLabel: label }),
    }),
    {
      name: "customer-location-storage", 
    }
  )
);