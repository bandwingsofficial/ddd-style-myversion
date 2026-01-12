import { ActorType } from '../domain/enums/actor-type.enum';

/**
 * Full authentication response
 * Returned by login & refresh endpoints
 */
export interface AuthContext {
  /* ================= IDENTITY ================= */

  /**
   * Actor ID (Customer / Delivery / OutletUser / SuperAdmin)
   */
  actorId: string;

  /**
   * Actor type
   */
  actorType: ActorType;

  /**
   * Session ID (single device / login)
   */
  sessionId: string;

  /**
   * Token version (global logout support)
   */
  tokenVersion: number;

  /**
   * Roles (derived from actorType, extensible for RBAC)
   */
  roles: string[];

  /* ================= TOKENS ================= */

  /**
   * JWT access token
   */
  accessToken: string;

  /**
   * Access token absolute expiry
   */
  accessTokenExpiresAt: Date;

  /**
   * Refresh token (opaque)
   */
  refreshToken: string;

  /**
   * Refresh token absolute expiry
   */
  refreshTokenExpiresAt: Date;
}
