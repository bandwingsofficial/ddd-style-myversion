import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CustomerAuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  actorId?: string;
  sessionId?: string;
  setSession: (data: any) => void;
  clearSession: () => void;
  setHydrated: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isHydrated: false,
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
      name: "customer-auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
