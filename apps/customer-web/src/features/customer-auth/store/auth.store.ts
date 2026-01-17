import { create } from "zustand";

interface CustomerAuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  actorId?: string;
  sessionId?: string;
  setSession: (data: any) => void;
  clearSession: () => void;
}

export const useCustomerAuthStore = create<CustomerAuthState>((set) => ({
  isAuthenticated: false,
  isHydrated: false,

  setSession: (data) =>
    set({
      isAuthenticated: true,
      isHydrated: true,
      actorId: data.actorId,
      sessionId: data.sessionId,
    }),

  clearSession: () =>
    set({
      isAuthenticated: false,
      isHydrated: true,
      actorId: undefined,
      sessionId: undefined,
    }),
}));
