import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ActorType } from '../domain/enums/actor-type.enum';
import { AuditAction } from '../domain/enums/audit-action.enum';

import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AuthSessionRepository } from '../repositories/auth-session.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';

import { TokenHash } from '../domain/value-objects/token-hash.vo';
import { SessionValidPolicy } from '../policies/session-valid.policy';

import {
  ForbiddenError,
  UnauthorizedError,
} from '../../../common/errors';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { AuthErrors } from '../constants/auth-errors';
import { TOKEN_CONSTANTS } from '../constants/token.constants';

import { TokenPair } from '../types/token-pair.type';

/* ===== INFRA HELPERS ===== */

import { TokenCryptoHelper } from '../../../infrastructure/security/token-crypto.helper';
import { TokenTimeHelper } from '../../../infrastructure/security/token-time.helper';
import { JwtHelper } from '../../../infrastructure/security/jwt.helper';

@Injectable()
export class TokenService {
  private readonly accessTtl: number;
  private readonly refreshTtl: number;
  private readonly jwtHelper: JwtHelper;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly sessionRepo: AuthSessionRepository,
    private readonly auditRepo: AuditLogRepository,
  ) {
    this.accessTtl =
      config.get<number>('jwt.accessTtl') ??
      (() => {
        throw new Error('jwt.accessTtl missing');
      })();

    this.refreshTtl =
      config.get<number>('jwt.refreshTtl') ??
      (() => {
        throw new Error('jwt.refreshTtl missing');
      })();

    const accessSecret =
      config.get<string>('jwt.accessSecret') ??
      (() => {
        throw new Error('jwt.accessSecret missing');
      })();

    // ✅ Infra helper initialization
    this.jwtHelper = new JwtHelper(
      this.jwt,
      accessSecret,
      this.accessTtl,
    );
  }

  /* ================================================= */
  /* ISSUE TOKEN PAIR (LOGIN / MFA / OTP)              */
  /* ================================================= */

  async issueTokens(params: {
    actorType: ActorType;
    actorId: string;
    sessionId: string;
    tokenVersion: number;
  }): Promise<TokenPair> {
    const session = await this.sessionRepo.findById(params.sessionId);

    if (!session) {
      throw new ForbiddenError(
        AuthErrors.FORBIDDEN,
        'Invalid session',
      );
    }

    SessionValidPolicy.check(session);

    const accessTokenExpiresAt =
      TokenTimeHelper.expiresAt(this.accessTtl);

    const refreshTokenExpiresAt =
      TokenTimeHelper.expiresAt(this.refreshTtl);

    return this.prisma.$transaction(async (tx) => {
      const accessToken = this.jwtHelper.signAccessToken({
        actorType: params.actorType,
        actorId: params.actorId,
        sessionId: session.id,
        tokenVersion: params.tokenVersion,
      });

      const refreshPlain =
        TokenCryptoHelper.generateRandomHex(
          TOKEN_CONSTANTS.REFRESH.BYTE_LENGTH,
        );

      const refreshHash = TokenHash.fromHash(
        TokenCryptoHelper.hash(
          refreshPlain,
          TOKEN_CONSTANTS.HASH.ALGORITHM,
        ),
      );

      await this.refreshTokenRepo.create(
        {
          sessionId: session.id,
          tokenHash: refreshHash,
          expiresAt: refreshTokenExpiresAt,
        },
        tx,
      );

      await this.auditRepo.create(
        {
          actorType: params.actorType,
          actorId: params.actorId,
          sessionId: session.id,
          action: AuditAction.TOKEN_ISSUED,
        },
        tx,
      );

      return {
        accessToken,
        refreshToken: refreshPlain,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
      };
    });
  }

  /* ================================================= */
  /* ROTATE REFRESH TOKEN                              */
  /* ================================================= */

  async rotateRefreshToken(params: {
    refreshToken: string;
    tokenVersion: number;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<TokenPair> {
    // Hard reject JWT-looking strings
    if (params.refreshToken.includes('.')) {
      throw new UnauthorizedError(
        AuthErrors.REFRESH_TOKEN_INVALID,
        'Invalid refresh token',
      );
    }

    const tokenHash = TokenHash.fromHash(
      TokenCryptoHelper.hash(
        params.refreshToken,
        TOKEN_CONSTANTS.HASH.ALGORITHM,
      ),
    );

    const stored =
      await this.refreshTokenRepo.findByTokenHash(tokenHash);

    if (!stored) {
      throw new UnauthorizedError(
        AuthErrors.REFRESH_TOKEN_INVALID,
        'Invalid refresh token',
      );
    }

    /**
     * Defense-in-depth:
     * Reuse or expiry here is a HARD security incident.
     */
    if (stored.isReuseDetected()) {
      await this.killSession(
        stored.sessionId,
        AuditAction.TOKEN_REUSE_DETECTED,
        params,
      );

      throw new UnauthorizedError(
        AuthErrors.REFRESH_TOKEN_REUSED,
        'Refresh token reuse detected',
      );
    }

    if (stored.isExpired()) {
      await this.killSession(
        stored.sessionId,
        AuditAction.SESSION_REVOKED,
        params,
      );

      throw new UnauthorizedError(
        AuthErrors.REFRESH_TOKEN_EXPIRED,
        'Refresh token expired',
      );
    }

    const session = await this.sessionRepo.findById(
      stored.sessionId,
    );

    if (!session) {
      throw new UnauthorizedError(
        AuthErrors.UNAUTHORIZED,
        'Invalid session',
      );
    }

    SessionValidPolicy.check(session);

    const accessTokenExpiresAt =
      TokenTimeHelper.expiresAt(this.accessTtl);

    const refreshTokenExpiresAt =
      TokenTimeHelper.expiresAt(this.refreshTtl);

    return this.prisma.$transaction(async (tx) => {
      const newPlain =
        TokenCryptoHelper.generateRandomHex(
          TOKEN_CONSTANTS.REFRESH.BYTE_LENGTH,
        );

      const newHash = TokenHash.fromHash(
        TokenCryptoHelper.hash(
          newPlain,
          TOKEN_CONSTANTS.HASH.ALGORITHM,
        ),
      );

      const newToken = await this.refreshTokenRepo.create(
        {
          sessionId: session.id,
          tokenHash: newHash,
          expiresAt: refreshTokenExpiresAt,
        },
        tx,
      );

      await this.refreshTokenRepo.markAsRotated(
        stored.id,
        newToken.id,
        tx,
      );

      const accessToken = this.jwtHelper.signAccessToken({
        actorType: session.actorType,
        actorId: session.actorId,
        sessionId: session.id,
        tokenVersion: params.tokenVersion,
      });

      await this.auditRepo.create(
        {
          actorType: session.actorType,
          actorId: session.actorId,
          sessionId: session.id,
          action: AuditAction.TOKEN_REFRESHED,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );

      return {
        accessToken,
        refreshToken: newPlain,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
      };
    });
  }

  /* ================================================= */
  /* SESSION KILL (SECURITY INCIDENT)                  */
  /* ================================================= */

  private async killSession(
    sessionId: string,
    action: AuditAction,
    params: { ipAddress?: string; userAgent?: string },
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const session = await this.sessionRepo.findById(
        sessionId,
        tx,
      );
      if (!session || session.isRevoked()) return;

      await this.refreshTokenRepo.revokeBySessionId(
        session.id,
        tx,
      );
      await this.sessionRepo.revoke(session.id, tx);

      await this.auditRepo.create(
        {
          actorType: session.actorType,
          actorId: session.actorId,
          sessionId: session.id,
          action,
          metadata: { reason: action },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });
  }
}
