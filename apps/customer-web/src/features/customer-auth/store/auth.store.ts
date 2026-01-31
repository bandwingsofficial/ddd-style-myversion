import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CustomerAuthState {
  isAuthenticated: boolean;
  isHydrated: boolean; // We use this to know when localStorage has loaded
  actorId?: string;
  sessionId?: string;
  setSession: (data: any) => void;
  clearSession: () => void;
  setHydrated: () => void; // Helper to mark store as ready
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isHydrated: false, // Starts false, becomes true after storage loads
      actorId: undefined,
      sessionId: undefined,

      setSession: (data) =>
        set({
          isAuthenticated: true,
          actorId: data.actorId,
          sessionId: data.sessionId,
        }),

      clearSession: () =>
        set({
          isAuthenticated: false,
          actorId: undefined,
          sessionId: undefined,
        }),
      
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "customer-auth-storage", // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // Use local storage
      
      // ✅ This is crucial: specific logic to handle hydration (loading from storage)
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);