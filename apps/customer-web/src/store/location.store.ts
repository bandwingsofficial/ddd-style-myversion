import { create } from "zustand";

interface LocationState {
  location: Location | null;
  setLocation: (location: Location) => void;
  loadLocation: () => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,

  setLocation: (location) => {
    localStorage.setItem("user_location", JSON.stringify(location));
    set({ location });
  },

  loadLocation: () => {
    const stored = localStorage.getItem("user_location");
    if (stored) {
      set({ location: JSON.parse(stored) });
    }
  },

  clearLocation: () => {
    localStorage.removeItem("user_location");
    set({ location: null });
  },
}));
