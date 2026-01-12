// src/modules/outlets/services/outlet-user.service.ts

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PasswordHelper } from '../../../infrastructure/security/password.helper';

import { OutletUser } from '../domain/models/outlet-user.model';
import { OutletUserRepository } from '../repositories/outlet-user.repository';
import { OutletRepository } from '../repositories/outlet.repository';
import { OutletUserActivePolicy } from '../policies/outlet-user-active.policy';

import { AuditLogRepository } from '../../auth/repositories/audit-log.repository';
import { ActorType } from '../../auth/domain/enums/actor-type.enum';
import { AuditAction } from '../../auth/domain/enums/audit-action.enum';

import {
  ValidationError,
  InvariantViolationError,
} from '../../../common/errors';

const PASSWORD_SALT_ROUNDS = 12;

@Injectable()
export class OutletUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outletRepo: OutletRepository,
    private readonly outletUserRepo: OutletUserRepository,
    private readonly auditRepo: AuditLogRepository,
  ) {}

  /* ================================================= */
  /* READS                                             */
  /* ================================================= */

  async getById(userId: string): Promise<OutletUser | null> {
    return this.outletUserRepo.findById(userId);
  }

  async getByOutlet(outletId: string): Promise<OutletUser[]> {
    return this.outletUserRepo.findByOutlet(outletId);
  }

  /* ================================================= */
  /* CREATE OUTLET USER (ADMIN)                         */
  /* ================================================= */

  async createUser(params: {
    outletId: string;
    email: string;
    rawPassword: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{
    id: string;
    outletId: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const email = params.email.trim().toLowerCase();

    /* ---------- 1️⃣ OUTLET MUST EXIST ---------- */
    const outlet = await this.outletRepo.findById(
      params.outletId,
    );

    if (!outlet) {
      throw new ValidationError(
        'OUTLET_NOT_FOUND',
        'Outlet does not exist. Create outlet first.',
      );
    }

    /* ---------- 2️⃣ EMAIL MUST BE UNIQUE ---------- */
    const existingUser =
      await this.outletUserRepo.findByEmail(email);

    if (existingUser) {
      throw new ValidationError(
        'OUTLET_USER_ALREADY_EXISTS',
        'Email already exists. Use a different email.',
      );
    }

    /* ---------- 3️⃣ HASH PASSWORD ---------- */
    const passwordHash = await PasswordHelper.hash(
      params.rawPassword,
      PASSWORD_SALT_ROUNDS,
    );

    let createdUser!: OutletUser;

    /* ---------- 4️⃣ TRANSACTION ---------- */
    try {
      await this.prisma.$transaction(async (tx) => {
        const user = OutletUser.createNew({
          outletId: params.outletId,
          email,
          passwordHash,
        });

        createdUser =
          await this.outletUserRepo.create(user, tx);

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
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ValidationError(
          'OUTLET_USER_ALREADY_EXISTS',
          'Email already exists. Use a different email.',
        );
      }
      throw err;
    }

    return {
      id: createdUser.id,
      outletId: createdUser.outletId,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };
  }

  /* ================================================= */
  /* RESET PASSWORD (ADMIN)                             */
  /* ================================================= */

  async resetPassword(params: {
    email: string;
    newRawPassword: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{
    email: string;
    updatedAt: Date;
  }> {
    const email = params.email.trim().toLowerCase();

    const user =
      await this.outletUserRepo.findByEmail(email);

    if (!user) {
      throw new ValidationError(
        'OUTLET_USER_NOT_FOUND',
        'Outlet user not found',
      );
    }

    /* ---------- DOMAIN POLICY ---------- */
    try {
      OutletUserActivePolicy.enforce(user);
    } catch {
      throw new InvariantViolationError(
        'OUTLET_USER_DISABLED',
        'Outlet user is disabled',
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
      savedUser =
        await this.outletUserRepo.updatePassword(
          updatedUser,
          tx,
        );

      await this.auditRepo.create(
        {
          actorType: ActorType.SUPER_ADMIN,
          actorId: params.adminId,
          action:
            AuditAction.OUTLET_USER_PASSWORD_RESET,
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

  /* ================================================= */
  /* DISABLE / ENABLE OUTLET USER (SOFT DELETE)        */
  /* ================================================= */

  async disableUser(params: {
    outletUserId: string;
    adminId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ id: string; isActive: false }> {
    const user = await this.outletUserRepo.findById(
      params.outletUserId,
    );

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
      await this.outletUserRepo.updateStatus(
        disabledUser,
        tx,
      );

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
    const user = await this.outletUserRepo.findById(
      params.outletUserId,
    );

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
      await this.outletUserRepo.updateStatus(
        enabledUser,
        tx,
      );

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
}
