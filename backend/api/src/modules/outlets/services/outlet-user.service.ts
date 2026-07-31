// src/modules/outlets/services/outlet-user.service.ts

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';
import { PasswordHelper } from '../../../infrastructure/security/password.helper';

import { OutletUser } from '../domain/models/outlet-user.model';
import { OutletUserRole } from '../domain/enums/outlet-user-role.enum';
import { OutletUserRepository } from '../repositories/outlet-user.repository';
import { OutletRepository } from '../repositories/outlet.repository';

import { AuditLogRepository } from '../../auth/repositories/audit-log.repository';
import { AuthSessionRepository } from '../../auth/repositories/auth-session.repository';
import { RefreshTokenRepository } from '../../auth/repositories/refresh-token.repository';
import { ActorType } from '../../auth/domain/enums/actor-type.enum';
import { AuditAction } from '../../auth/domain/enums/audit-action.enum';

import { ValidationError } from '../../../common/errors';

const PASSWORD_SALT_ROUNDS = 12;

function normalizePhone(phone?: string): string | undefined {
  const trimmed = phone?.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\s/g, '');
}

@Injectable()
export class OutletUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outletRepo: OutletRepository,
    private readonly outletUserRepo: OutletUserRepository,
    private readonly auditRepo: AuditLogRepository,
    private readonly sessionRepo: AuthSessionRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {}

  async getById(userId: string): Promise<OutletUser | null> {
    return this.outletUserRepo.findById(userId);
  }

  async getByOutlet(outletId: string): Promise<OutletUser[]> {
    return this.outletUserRepo.findByOutlet(outletId);
  }

  /**
   * Deactivates every active outlet user and revokes their sessions.
   * Used when an outlet is inactivated (outlet status is master).
   */
  async inactivateAllUsersForOutlet(
    params: {
      outletId: string;
      adminId: string;
      ipAddress?: string;
      userAgent?: string;
    },
    tx: PrismaTransaction,
  ): Promise<{
    userIds: string[];
    usersInactivated: number;
    sessionsRevoked: number;
  }> {
    const users = await this.outletUserRepo.findByOutlet(params.outletId, tx);
    const userIds: string[] = [];
    let usersInactivated = 0;
    let sessionsRevoked = 0;

    for (const user of users) {
      if (!user.isActive) {
        continue;
      }

      const disabledUser = user.disable();
      await this.outletUserRepo.updateStatus(disabledUser, tx);
      usersInactivated++;
      userIds.push(user.id);

      sessionsRevoked += await this.revokeAllSessionsForUser(user.id, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_USER_DISABLED,
          metadata: {
            outletUserId: user.id,
            email: user.email,
            outletId: params.outletId,
            reason: 'OUTLET_INACTIVATED',
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    }

    return { userIds, usersInactivated, sessionsRevoked };
  }

  private async revokeAllSessionsForUser(
    userId: string,
    tx: PrismaTransaction,
  ): Promise<number> {
    const activeSessions = await this.sessionRepo.findActiveByActor(
      ActorType.OUTLET_USER,
      userId,
      tx,
    );

    for (const session of activeSessions) {
      await this.refreshTokenRepo.revokeBySessionId(session.id, tx);
    }

    if (activeSessions.length === 0) {
      return 0;
    }

    return this.sessionRepo.revokeAllForActor(
      ActorType.OUTLET_USER,
      userId,
      tx,
    );
  }

  async createUser(params: {
    outletId: string;
    name: string;
    email: string;
    phone?: string;
    role: OutletUserRole;
    rawPassword: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<OutletUser> {
    const email = params.email.trim().toLowerCase();
    const phone = normalizePhone(params.phone);

    const outlet = await this.outletRepo.findById(params.outletId);

    if (!outlet) {
      throw new ValidationError(
        'OUTLET_NOT_FOUND',
        'Outlet does not exist. Create outlet first.',
      );
    }

    const existingEmail = await this.outletUserRepo.findByEmail(email);

    if (existingEmail) {
      throw new ValidationError(
        'OUTLET_USER_ALREADY_EXISTS',
        'Email already exists. Use a different email.',
      );
    }

    if (phone) {
      const existingPhone = await this.outletUserRepo.findByPhone(phone);

      if (existingPhone) {
        throw new ValidationError(
          'OUTLET_USER_PHONE_EXISTS',
          'Phone number already exists. Use a different phone number.',
        );
      }
    }

    const passwordHash = await PasswordHelper.hash(
      params.rawPassword,
      PASSWORD_SALT_ROUNDS,
    );

    let createdUser!: OutletUser;

    try {
      await this.prisma.$transaction(async (tx) => {
        const user = OutletUser.createNew({
          outletId: params.outletId,
          name: params.name,
          phone,
          role: params.role,
          email,
          passwordHash,
        });

        createdUser = await this.outletUserRepo.create(user, tx);

        await this.auditRepo.create(
          {
            actorType: ActorType.SUPER_ADMIN,
            actorId: params.adminId,
            action: AuditAction.OUTLET_USER_CREATED,
            metadata: {
              outletUserId: createdUser.id,
              outletId: createdUser.outletId,
              email,
            },
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
          },
          tx,
        );
      });
    } catch (err: unknown) {
      const prismaError = err as { code?: string };

      if (prismaError.code === 'P2002') {
        throw new ValidationError(
          'OUTLET_USER_ALREADY_EXISTS',
          'Email or phone already exists. Use different values.',
        );
      }

      throw err;
    }

    return createdUser;
  }

  async updateUser(params: {
    outletUserId: string;
    name: string;
    phone?: string;
    role: OutletUserRole;
    outletId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<OutletUser> {
    const user = await this.outletUserRepo.findById(params.outletUserId);

    if (!user) {
      throw new ValidationError(
        'OUTLET_USER_NOT_FOUND',
        'Outlet user not found',
      );
    }

    const outlet = await this.outletRepo.findById(params.outletId);

    if (!outlet) {
      throw new ValidationError('OUTLET_NOT_FOUND', 'Outlet not found');
    }

    const phone = normalizePhone(params.phone);

    if (phone) {
      const existingPhone = await this.outletUserRepo.findByPhone(phone);

      if (existingPhone && existingPhone.id !== user.id) {
        throw new ValidationError(
          'OUTLET_USER_PHONE_EXISTS',
          'Phone number already exists. Use a different phone number.',
        );
      }
    }

    const updatedUser = user.updateDetails({
      name: params.name,
      phone,
      role: params.role,
      outletId: params.outletId,
    });

    let savedUser!: OutletUser;

    await this.prisma.$transaction(async (tx) => {
      savedUser = await this.outletUserRepo.updateDetails(updatedUser, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_USER_ENABLED,
          metadata: {
            outletUserId: user.id,
            email: user.email,
            updated: true,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    return savedUser;
  }

  async resetPassword(params: {
    email: string;
    newRawPassword: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ email: string; updatedAt: Date }> {
    const email = params.email.trim().toLowerCase();

    const user = await this.outletUserRepo.findByEmail(email);

    if (!user) {
      throw new ValidationError(
        'OUTLET_USER_NOT_FOUND',
        'Outlet user not found',
      );
    }

    const newPasswordHash = await PasswordHelper.hash(
      params.newRawPassword,
      PASSWORD_SALT_ROUNDS,
    );

    const updatedUser = user.resetPassword({
      newPasswordHash,
    });

    let savedUser!: OutletUser;

    await this.prisma.$transaction(async (tx) => {
      savedUser = await this.outletUserRepo.updatePassword(updatedUser, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_USER_PASSWORD_RESET,
          metadata: {
            outletUserId: savedUser.id,
            email,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    return {
      email: savedUser.email,
      updatedAt: savedUser.updatedAt,
    };
  }

  async disableUser(params: {
    outletUserId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ id: string; isActive: false }> {
    const user = await this.outletUserRepo.findById(params.outletUserId);

    if (!user) {
      throw new ValidationError(
        'OUTLET_USER_NOT_FOUND',
        'Outlet user not found',
      );
    }

    if (!user.isActive) {
      return { id: user.id, isActive: false };
    }

    const disabledUser = user.disable();

    await this.prisma.$transaction(async (tx) => {
      await this.outletUserRepo.updateStatus(disabledUser, tx);

      await this.revokeAllSessionsForUser(user.id, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_USER_DISABLED,
          metadata: {
            outletUserId: user.id,
            email: user.email,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    return { id: user.id, isActive: false };
  }

  async enableUser(params: {
    outletUserId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ id: string; isActive: true }> {
    const user = await this.outletUserRepo.findById(params.outletUserId);

    if (!user) {
      throw new ValidationError(
        'OUTLET_USER_NOT_FOUND',
        'Outlet user not found',
      );
    }

    if (user.isActive) {
      return { id: user.id, isActive: true };
    }

    const enabledUser = user.enable();

    await this.prisma.$transaction(async (tx) => {
      await this.outletUserRepo.updateStatus(enabledUser, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_USER_ENABLED,
          metadata: {
            outletUserId: user.id,
            email: user.email,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    return { id: user.id, isActive: true };
  }

  async deleteUser(params: {
    outletUserId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ id: string }> {
    const user = await this.outletUserRepo.findById(params.outletUserId);

    if (!user) {
      throw new ValidationError(
        'OUTLET_USER_NOT_FOUND',
        'Outlet user not found',
      );
    }

    if (user.isActive) {
      throw new ValidationError(
        'OUTLET_USER_ACTIVE',
        'Deactivate the user before deleting.',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const activeSessions = await this.sessionRepo.findActiveByActor(
        ActorType.OUTLET_USER,
        user.id,
        tx,
      );

      for (const session of activeSessions) {
        await this.refreshTokenRepo.revokeBySessionId(session.id, tx);
      }

      if (activeSessions.length > 0) {
        await this.sessionRepo.revokeAllForActor(
          ActorType.OUTLET_USER,
          user.id,
          tx,
        );
      }

      await this.outletUserRepo.deleteById(user.id, tx);

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action: AuditAction.OUTLET_USER_DELETED,
          metadata: {
            outletUserId: user.id,
            email: user.email,
          },
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
        tx,
      );
    });

    return { id: user.id };
  }
}
