// src/modules/auth/domain/models/auth-session.model.ts

import { ValidationError } from '../../../../common/errors';
import { ActorType } from '../enums/actor-type.enum';
import { DeviceInfo } from '../value-objects/device-info.vo';

export class AuthSession {
  readonly id: string;
  readonly actorType: ActorType;
  readonly actorId: string;

  readonly deviceInfo: DeviceInfo;

  readonly createdAt: Date;
  readonly lastUsedAt: Date;
  readonly revokedAt?: Date;

  private constructor(params: {
    id: string;
    actorType: ActorType;
    actorId: string;
    deviceInfo?: DeviceInfo;
    createdAt: Date;
    lastUsedAt: Date;
    revokedAt?: Date;
  }) {
    this.id = params.id;
    this.actorType = params.actorType;
    this.actorId = params.actorId;

    this.deviceInfo = params.deviceInfo ?? DeviceInfo.create();

    this.createdAt = params.createdAt;
    this.lastUsedAt = params.lastUsedAt;
    this.revokedAt = params.revokedAt;

    this.assertValidState();
    Object.freeze(this);
  }

  /* ---------------------------------------------- */
  /* FACTORIES                                      */
  /* ---------------------------------------------- */

  static createNew(params: {
    id: string;
    actorType: ActorType;
    actorId: string;
    deviceInfo?: DeviceInfo;
    now?: Date;
  }): AuthSession {
    const now = params.now ?? new Date();

    return new AuthSession({
      id: params.id,
      actorType: params.actorType,
      actorId: params.actorId,
      deviceInfo: params.deviceInfo,
      createdAt: now,
      lastUsedAt: now,
    });
  }

  static rehydrate(params: {
    id: string;
    actorType: ActorType;
    actorId: string;
    deviceInfo?: DeviceInfo;
    createdAt: Date;
    lastUsedAt: Date;
    revokedAt?: Date;
  }): AuthSession {
    return new AuthSession(params);
  }

  /* ---------------------------------------------- */
  /* DOMAIN QUERIES                                 */
  /* ---------------------------------------------- */

  isActive(): boolean {
    return !this.revokedAt;
  }

  isRevoked(): boolean {
    return !!this.revokedAt;
  }

  /* ---------------------------------------------- */
  /* DOMAIN TRANSITIONS                             */
  /* ---------------------------------------------- */

  touch(now: Date = new Date()): AuthSession {
    return new AuthSession({
      id: this.id,
      actorType: this.actorType,
      actorId: this.actorId,
      deviceInfo: this.deviceInfo,
      createdAt: this.createdAt,
      lastUsedAt: now,
      revokedAt: this.revokedAt,
    });
  }

  revoke(now: Date = new Date()): AuthSession {
    if (this.revokedAt) return this;

    return new AuthSession({
      id: this.id,
      actorType: this.actorType,
      actorId: this.actorId,
      deviceInfo: this.deviceInfo,
      createdAt: this.createdAt,
      lastUsedAt: this.lastUsedAt,
      revokedAt: now,
    });
  }

  /* ---------------------------------------------- */
  /* DOMAIN INVARIANTS                              */
  /* ---------------------------------------------- */

  private assertValidState(): void {
    if (this.lastUsedAt < this.createdAt) {
      throw new ValidationError(
        'AUTH_SESSION_INVALID_LAST_USED_AT',
        'Session lastUsedAt cannot be before createdAt',
        {
          createdAt: this.createdAt,
          lastUsedAt: this.lastUsedAt,
        },
      );
    }

    if (this.revokedAt && this.revokedAt < this.createdAt) {
      throw new ValidationError(
        'AUTH_SESSION_INVALID_REVOKED_AT',
        'Session revokedAt cannot be before createdAt',
        {
          createdAt: this.createdAt,
          revokedAt: this.revokedAt,
        },
      );
    }
  }
}
