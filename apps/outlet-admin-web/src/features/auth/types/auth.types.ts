export type OutletSession = {
  actorType: 'OUTLET_USER';
  actorId: string;
  sessionId: string;
  roles: string[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthContextState = {
  session: OutletSession | null;
  loading: boolean;
  isAuthenticated: boolean;
};
