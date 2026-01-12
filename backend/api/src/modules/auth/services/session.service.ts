import { Injectable } from '@nestjs/common';

import { ActorType } from '../domain/enums/actor-type.enum';
import { AuditAction } from '../domain/enums/audit-action.enum';
import { AuthSession } from '../domain/models/auth-session.model';
import { DeviceInfo } from '../domain/value-objects/device-info.vo';

import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AuthSessionRepository } from '../repositories/auth-session.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';

import { ForbiddenError } from '../../../common/errors';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { AuthErrors } from '../constants/auth-errors';

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionRepo: AuthSessionRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly auditRepo: AuditLogRepository,
  ) {}

  /* ================================================= */
  /* CREATE SESSION (LOGIN)                            */
  /* ================================================= */

  async createSession(params: {
    actorType: ActorType;
    actorId: string;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuthSession> {
    const deviceInfo = DeviceInfo.create({
      deviceId: params.deviceId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return this.prisma.$transaction(async (tx) => {
      const session = await this.sessionRepo.create(
        {
          actorType: params.actorType,
          actorId: params.actorId,
          deviceInfo,
        },
        tx,
      );

      await this.auditRepo.create(
        {
          actorType: params.actorType,
          actorId: params.actorId,
          sessionId: session.id,
          action: AuditAction.LOGIN_SUCCESS,
          metadata: {
            ...deviceInfo.toJSON(),
            sessionId: session.id,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );

      return session;
    });
  }

  /* ================================================= */
  /* FIND ACTIVE SESSION (JWT STRATEGY)                */
  /* ================================================= */

  async findActiveSession(params: {
    sessionId: string;
    actorType: ActorType;
    actorId: string;
    tokenVersion: number;
  }): Promise<AuthSession | null> {
    const session = await this.sessionRepo.findById(params.sessionId);

    if (!session) {
      return null;
    }

    if (
      session.actorType !== params.actorType ||
      session.actorId !== params.actorId
    ) {
      return null;
    }

    if (session.isRevoked()) {
      return null;
    }

    // Optional: validate tokenVersion here (logout-all protection)

    await this.sessionRepo.touch(session.id);

    return session;
  }

  /* ================================================= */
  /* REVOKE SINGLE SESSION (LOGOUT)                    */
  /* ================================================= */

  async revokeSession(params: {
    sessionId: string;
    actorType: ActorType;
    actorId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const session = await this.sessionRepo.findById(params.sessionId);

    if (
      !session ||
      session.actorType !== params.actorType ||
      session.actorId !== params.actorId
    ) {
      throw new ForbiddenError(
        AuthErrors.FORBIDDEN,
        'You are not allowed to revoke this session',
      );
    }

    if (session.isRevoked()) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await this.refreshTokenRepo.revokeBySessionId(session.id, tx);
      await this.sessionRepo.revoke(session.id, tx);

      await this.auditRepo.create(
        {
          actorType: params.actorType,
          actorId: params.actorId,
          sessionId: session.id,
          action: AuditAction.LOGOUT,
          metadata: {
            reason: 'USER_LOGOUT',
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });
  }

  /* ================================================= */
  /* REVOKE ALL SESSIONS (LOGOUT ALL)                  */
  /* ================================================= */

  async revokeAllSessions(params: {
    actorType: ActorType;
    actorId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ revokedCount: number }> {
    let revokedCount = 0;

    await this.prisma.$transaction(async (tx) => {
      const sessions = await this.sessionRepo.findActiveByActor(
        params.actorType,
        params.actorId,
        tx,
      );

      for (const session of sessions) {
        await this.refreshTokenRepo.revokeBySessionId(session.id, tx);
      }

      revokedCount = await this.sessionRepo.revokeAllForActor(
        params.actorType,
        params.actorId,
        tx,
      );

      await this.auditRepo.create(
        {
          actorType: params.actorType,
          actorId: params.actorId,
          action: AuditAction.LOGOUT_ALL,
          metadata: {
            revokedCount,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    return { revokedCount };
  }

  /* ================================================= */
  /* TOUCH SESSION (ACTIVITY TRACKING)                 */
  /* ================================================= */

  async touchSession(sessionId: string): Promise<void> {
    await this.sessionRepo.touch(sessionId);
  }
}
