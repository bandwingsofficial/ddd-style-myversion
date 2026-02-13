import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { CustomerProfile } from '../domain/customer-profile.model';

/* ================================================= */
/* REPOSITORY                                       */
/* ================================================= */

@Injectable()
export class CustomerProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* READ – SINGLE                                    */
  /* ================================================= */

  async findByCustomerId(
    customerId: string,
    tx?: PrismaTransaction,
  ): Promise<CustomerProfile | null> {
    const row = await (tx ?? this.prisma).customerProfile.findUnique({
      where: { customerId },
    });

    return row ? this.toDomain(row) : null;
  }

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<CustomerProfile | null> {
    const row = await (tx ?? this.prisma).customerProfile.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  /* ================================================= */
  /* CREATE                                            */
  /* ================================================= */

  async create(
    profile: CustomerProfile,
    tx?: PrismaTransaction,
  ): Promise<CustomerProfile> {
    const client = tx ?? this.prisma;

    const row = await client.customerProfile.create({
      data:
        this.toPersistence(profile) satisfies
        Prisma.CustomerProfileUncheckedCreateInput,
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* UPDATE                                            */
  /* ================================================= */

  async update(
    profile: CustomerProfile,
    tx?: PrismaTransaction,
  ): Promise<CustomerProfile> {
    const client = tx ?? this.prisma;

    const row = await client.customerProfile.update({
      where: { id: profile.id },
      data:
        this.toUpdatePersistence(profile) satisfies
        Prisma.CustomerProfileUncheckedUpdateInput,
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* DELETE                                            */
  /* ================================================= */

  async deleteByCustomerId(
    customerId: string,
    tx?: PrismaTransaction,
  ): Promise<void> {
    await (tx ?? this.prisma).customerProfile.delete({
      where: { customerId },
    });
  }

  /* ================================================= */
  /* UPSERT                                            */
  /* ================================================= */

  async upsert(
    profile: CustomerProfile,
    tx?: PrismaTransaction,
  ): Promise<CustomerProfile> {
    const client = tx ?? this.prisma;

    const row = await client.customerProfile.upsert({
      where: { customerId: profile.customerId },
      create:
        this.toPersistence(profile) satisfies
        Prisma.CustomerProfileUncheckedCreateInput,
      update:
        this.toUpdatePersistence(profile) satisfies
        Prisma.CustomerProfileUncheckedUpdateInput,
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* PRIVATE MAPPERS                                   */
  /* ================================================= */

  private toDomain(row: {
    id: string;
    customerId: string;

    fullName: string | null;
    email: string | null;
    avatarUrl: string | null;

    gender: string | null;
    dob: Date | null;

    referralCode: string | null;

    createdAt: Date;
    updatedAt: Date;
  }): CustomerProfile {
    return CustomerProfile.rehydrate({
      id: row.id,
      customerId: row.customerId,

      fullName: row.fullName ?? undefined,
      email: row.email ?? undefined,
      avatarUrl: row.avatarUrl ?? undefined,

      gender: row.gender ?? undefined,
      dob: row.dob ?? undefined,

      referralCode: row.referralCode ?? undefined,

      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toPersistence(
    profile: CustomerProfile,
  ): Prisma.CustomerProfileUncheckedCreateInput {
    return {
      id: profile.id,
      customerId: profile.customerId,

      fullName: profile.fullName ?? null,
      email: profile.email ?? null,
      avatarUrl: profile.avatarUrl ?? null,

      gender: profile.gender ?? null,
      dob: profile.dob ?? null,

      referralCode: profile.referralCode ?? null,

      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private toUpdatePersistence(
    profile: CustomerProfile,
  ): Prisma.CustomerProfileUncheckedUpdateInput {
    return {
      fullName: profile.fullName ?? null,
      email: profile.email ?? null,
      avatarUrl: profile.avatarUrl ?? null,

      gender: profile.gender ?? null,
      dob: profile.dob ?? null,

      referralCode: profile.referralCode ?? null,

      updatedAt: profile.updatedAt,
    };
  }
}
