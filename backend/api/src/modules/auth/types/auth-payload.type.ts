import { ActorType } from '../domain/enums/actor-type.enum';

/**
 * JWT payload (compact, immutable snapshot)
 */
export interface AuthPayload {
  /**
   * Actor ID
   */
  sub: string;

  /**
   * Session ID
   */
  sid: string;

  /**
   * Actor type
   */
  at: ActorType;

  /**
   * Token version
   */
  tv: number;

  /**
   * Issued at (unix seconds)
   */
  iat?: number;

  /**
   * Expiry (unix seconds)
   */
  exp?: number;
}
