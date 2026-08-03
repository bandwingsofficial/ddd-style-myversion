import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface SessionData {
  actorId: string;
  sessionId: string;
  actorType?: string;
}

interface CustomerAuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  sessionChecked: boolean;
  actorId?: string;
  sessionId?: string;
  setSession: (data: SessionData) => void;
  clearSession: () => void;
  setHydrated: () => void;
  markSessionChecked: () => void;
  resetPendingVerification: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isHydrated: false,
      sessionChecked: false,
      actorId: undefined,
      sessionId: undefined,

      setSession: (data) =>
        set({
          isAuthenticated: true,
          actorId: data.actorId,
          sessionId: data.sessionId,
          sessionChecked: true,
        }),

      clearSession: () =>
        set({
          isAuthenticated: false,
          actorId: undefined,
          sessionId: undefined,
        }),

      resetPendingVerification: () =>
        set({
          isAuthenticated: false,
          sessionChecked: false,
        }),

      setHydrated: () => set({ isHydrated: true }),
      markSessionChecked: () => set({ sessionChecked: true }),
    }),
    {
      name: "customer-auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        actorId: state.actorId,
        sessionId: state.sessionId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.resetPendingVerification();
        state?.setHydrated();
      },
    },
  ),
);

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== "customer-auth-storage") return;

    void import("@/features/customer-auth/services/auth-sync.service").then(
      ({ syncSessionOnBoot }) => syncSessionOnBoot(),
    );
  });
}
