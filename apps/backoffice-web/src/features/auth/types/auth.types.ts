/* ===================================================== */
/* LOGIN (STEP 1)                                        */
/* ===================================================== */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  challengeId: string;
}

/* ===================================================== */
/* MFA VERIFY (STEP 2)                                   */
/* ===================================================== */

export interface VerifyMfaRequest {
  challengeId: string;
  code: string;
}

export interface VerifyMfaResponse {
  actorType: string;
  actorId: string;
  sessionId: string;
  roles: string[];
}

/* ===================================================== */
/* SESSION                                               */
/* ===================================================== */

export interface SessionResponse {
  actorType: string;
  actorId: string;
  sessionId: string;
}

/* ===================================================== */
/* AUTH STATE (FRONTEND ONLY)                             */
/* ===================================================== */

export interface AuthState {
  ready: boolean;
  authenticated: boolean;

  actorType?: string;
  actorId?: string;
  sessionId?: string;
}
