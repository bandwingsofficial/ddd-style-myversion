// src/modules/outlets/repositories/outlet-user.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { OutletUser } from '../domain/models/outlet-user.model';
import { OutletUserRole } from '../domain/enums/outlet-user-role.enum';

@Injectable()
export class OutletUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<OutletUser | null> {
    const client = tx ?? this.prisma;

    const row = await client.outletUser.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByEmail(
    email: string,
    tx?: PrismaTransaction,
  ): Promise<OutletUser | null> {
    const client = tx ?? this.prisma;

    const row = await client.outletUser.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByPhone(
    phone: string,
    tx?: PrismaTransaction,
  ): Promise<OutletUser | null> {
    const client = tx ?? this.prisma;
    const normalized = phone.replace(/\s/g, '');

    const row = await client.outletUser.findFirst({
      where: { phone: normalized },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByOutlet(
    outletId: string,
    tx?: PrismaTransaction,
  ): Promise<OutletUser[]> {
    const client = tx ?? this.prisma;

    const rows = await client.outletUser.findMany({
      where: { outletId },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async create(user: OutletUser, tx?: PrismaTransaction): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    const row = await client.outletUser.create({
      data: {
        id: user.id,
        outletId: user.outletId,
        name: user.name,
        phone: user.phone,
        role: user.role,
        email: user.email,
        passwordHash: user.passwordHash,
        isActive: user.isActive,
        failedAttempts: user.failedAttempts,
        lockedUntil: user.lockedUntil,
        tokenVersion: user.tokenVersion,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  async updatePassword(
    user: OutletUser,
    tx?: PrismaTransaction,
  ): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    const row = await client.outletUser.update({
      where: { id: user.id },
      data: {
        passwordHash: user.passwordHash,
        failedAttempts: user.failedAttempts,
        lockedUntil: user.lockedUntil,
        tokenVersion: user.tokenVersion,
        updatedAt: user.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  async updateStatus(
    user: OutletUser,
    tx?: PrismaTransaction,
  ): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    const row = await client.outletUser.update({
      where: { id: user.id },
      data: {
        isActive: user.isActive,
        failedAttempts: user.failedAttempts,
        lockedUntil: user.lockedUntil,
        tokenVersion: user.tokenVersion,
        updatedAt: user.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  async updateDetails(
    user: OutletUser,
    tx?: PrismaTransaction,
  ): Promise<OutletUser> {
    const client = tx ?? this.prisma;

    const row = await client.outletUser.update({
      where: { id: user.id },
      data: {
        name: user.name,
        phone: user.phone,
        role: user.role,
        outletId: user.outletId,
        updatedAt: user.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  async deleteById(id: string, tx?: PrismaTransaction): Promise<void> {
    const client = tx ?? this.prisma;
    await client.outletUser.delete({ where: { id } });
  }

  private toDomain(row: {
    id: string;
    outletId: string;
    name: string;
    phone: string | null;
    role: string;
    email: string;
    passwordHash: string;
    isActive: boolean;
    failedAttempts: number;
    lockedUntil: Date | null;
    tokenVersion: number;
    createdAt: Date;
    updatedAt: Date;
  }): OutletUser {
    return OutletUser.rehydrate({
      id: row.id,
      outletId: row.outletId,
      name: row.name,
      phone: row.phone,
      role: row.role as OutletUserRole,
      email: row.email,
      passwordHash: row.passwordHash,
      isActive: row.isActive,
      failedAttempts: row.failedAttempts,
      lockedUntil: row.lockedUntil,
      tokenVersion: row.tokenVersion,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
