import { CustomerProfile } from '../domain/customer-profile.model';
import { CustomerProfile as PrismaCustomerProfile } from '@prisma/client';

export class CustomerProfileMapper {
  /* ---------------------------------------------- */
  /* Prisma -> Domain                               */
  /* ---------------------------------------------- */

  static toDomain(row: PrismaCustomerProfile): CustomerProfile {
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

  /* ---------------------------------------------- */
  /* Domain -> Prisma                               */
  /* ---------------------------------------------- */

  static toPersistence(entity: CustomerProfile) {
    return {
      id: entity.id,
      customerId: entity.customerId,

      fullName: entity.fullName ?? null,
      email: entity.email ?? null,
      avatarUrl: entity.avatarUrl ?? null,

      gender: entity.gender ?? null,
      dob: entity.dob ?? null,

      referralCode: entity.referralCode ?? null,

      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
