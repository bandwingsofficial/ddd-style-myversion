// src/modules/auth/repositories/customer.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Customer } from '../domain/models/customer.model';
import { Phone } from '../domain/value-objects/phone.vo';

import { InvariantViolationError } from '../../../common/errors';

@Injectable()
export class CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    params: { phone: Phone },
    tx?: PrismaTransaction,
  ): Promise<Customer> {
    const client = tx ?? this.prisma;

    const row = await client.customer.create({
      data: {
        phone: params.phone.getRaw(),
      },
    });

    return this.toDomain(row);
  }

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<Customer | null> {
    const client = tx ?? this.prisma;

    const row = await client.customer.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByPhone(
    phone: Phone,
    tx?: PrismaTransaction,
  ): Promise<Customer | null> {
    const client = tx ?? this.prisma;

    const row = await client.customer.findUnique({
      where: { phone: phone.getRaw() },
    });

    return row ? this.toDomain(row) : null;
  }

  /**
   * Idempotent block operation
   */
  async block(
    customerId: string,
    tx?: PrismaTransaction,
  ): Promise<Customer> {
    const client = tx ?? this.prisma;

    await client.customer.updateMany({
      where: {
        id: customerId,
        isBlocked: false,
      },
      data: {
        isBlocked: true,
        blockedAt: new Date(),
      },
    });

    const customer = await client.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new InvariantViolationError(
        'CUSTOMER_NOT_FOUND',
        'Customer not found',
        { customerId },
      );
    }

    return this.toDomain(customer);
  }

  /**
   * Idempotent unblock operation
   */
  async unblock(
    customerId: string,
    tx?: PrismaTransaction,
  ): Promise<Customer> {
    const client = tx ?? this.prisma;

    await client.customer.updateMany({
      where: {
        id: customerId,
        isBlocked: true,
      },
      data: {
        isBlocked: false,
        blockedAt: null,
      },
    });

    const customer = await client.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new InvariantViolationError(
        'CUSTOMER_NOT_FOUND',
        'Customer not found',
        { customerId },
      );
    }

    return this.toDomain(customer);
  }

  async incrementTokenVersion(
    customerId: string,
    tx?: PrismaTransaction,
  ): Promise<Customer> {
    const client = tx ?? this.prisma;

    const row = await client.customer.update({
      where: { id: customerId },
      data: {
        tokenVersion: { increment: 1 },
      },
    });

    return this.toDomain(row);
  }

  /* ---------------------------------------------- */
  /* PRIVATE MAPPER                                 */
  /* ---------------------------------------------- */

  private toDomain(row: {
    id: string;
    phone: string;
    isBlocked: boolean;
    blockedAt: Date | null;
    tokenVersion: number;
    createdAt: Date;
  }): Customer {
    return Customer.rehydrate({
      id: row.id,
      phone: Phone.fromRaw(row.phone),
      isBlocked: row.isBlocked,
      blockedAt: row.blockedAt ?? undefined,
      tokenVersion: row.tokenVersion,
      createdAt: row.createdAt,
    });
  }
}
