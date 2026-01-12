import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { AuthSessionRepository } from '../repositories/auth-session.repository';
import { ActorType } from '../domain/enums/actor-type.enum';

import { TokenHash } from '../domain/value-objects/token-hash.vo';
import { UnauthorizedError } from '../../../common/errors';
import { AuthErrors } from '../constants/auth-errors';
import { TOKEN_CONSTANTS } from '../constants/token.constants';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly sessionRepo: AuthSessionRepository,
  ) {}

  /**
   * NORMAL WORKING STYLE (USED BY MOST REAL APPS)
   *
   * - Refresh tokens are session-level
   * - Reuse can happen due to retries / tabs / race
   * - DO NOT revoke session on reuse
   * - Logout happens ONLY on expiry or explicit revoke
   */
  async validateRefreshToken(
    refreshToken: string,
  ): Promise<{
    actorType: ActorType;
    actorId: string;
    sessionId: string;
  }> {
    // JWT-looking strings are NEVER valid refresh tokens
    if (refreshToken.includes('.')) {
      throw new UnauthorizedError(
        AuthErrors.REFRESH_TOKEN_INVALID,
        'Session expired or invalid',
      );
    }

    /* ---------- hash ---------- */

    const tokenHash = TokenHash.fromHash(
      crypto
        .createHash(TOKEN_CONSTANTS.HASH.ALGORITHM)
        .update(refreshToken)
        .digest('hex'),
    );

    /* ---------- lookup refresh token ---------- */

    const stored =
      await this.refreshTokenRepo.findByTokenHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedError(
        AuthErrors.REFRESH_TOKEN_INVALID,
        'Session expired or invalid',
      );
    }

    /**
     * 🔵 NORMAL BEHAVIOR
     * Reuse does NOT mean attack in normal apps
     * (can happen due to retries, multiple tabs, race)
     */
    if (stored.isReuseDetected()) {
      throw new UnauthorizedError(
        AuthErrors.REFRESH_TOKEN_REUSED,
        'Refresh token already used',
      );
    }

    if (stored.isExpired()) {
      throw new UnauthorizedError(
        AuthErrors.REFRESH_TOKEN_EXPIRED,
        'Session expired or invalid',
      );
    }

    /* ---------- load session ---------- */

    const session = await this.sessionRepo.findById(
      stored.sessionId,
    );

    if (!session || session.isRevoked()) {
      throw new UnauthorizedError(
        AuthErrors.SESSION_REVOKED,
        'Session expired or invalid',
      );
    }

    /* ---------- trusted auth context ---------- */

    return {
      actorType: session.actorType,
      actorId: session.actorId,
      sessionId: session.id,
    };
  }
}
