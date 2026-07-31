import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { DeliveryRule } from '../domain/models/delivery-rule.model';
import { DeliveryRuleStatus } from '../domain/enums/delivery-rule-status.enum';

type PrismaClientLike = PrismaService | Prisma.TransactionClient;

@Injectable()
export class DeliveryRuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<DeliveryRule | null> {
    const client = tx ?? this.prisma;
    const row = await client.deliveryRule.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByMinimumOrderAmount(
    minimumOrderAmount: number,
    tx?: PrismaTransaction,
  ): Promise<DeliveryRule | null> {
    const client = tx ?? this.prisma;
    const row = await client.deliveryRule.findFirst({
      where: { minimumOrderAmount },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByPriority(
    priority: number,
    tx?: PrismaTransaction,
  ): Promise<DeliveryRule | null> {
    const client = tx ?? this.prisma;
    const row = await client.deliveryRule.findUnique({ where: { priority } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(tx?: PrismaTransaction): Promise<DeliveryRule[]> {
    const client = tx ?? this.prisma;
    const rows = await client.deliveryRule.findMany({
      orderBy: [{ priority: 'asc' }, { minimumOrderAmount: 'asc' }],
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findActiveOrderedByMinDesc(
    tx?: PrismaTransaction,
  ): Promise<DeliveryRule[]> {
    const client = tx ?? this.prisma;
    const rows = await client.deliveryRule.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { minimumOrderAmount: 'desc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async create(rule: DeliveryRule, tx?: PrismaTransaction): Promise<DeliveryRule> {
    const client = tx ?? this.prisma;
    const row = await client.deliveryRule.create({
      data: this.toPrisma(rule),
    });
    return this.toDomain(row);
  }

  async update(rule: DeliveryRule, tx?: PrismaTransaction): Promise<DeliveryRule> {
    const client = tx ?? this.prisma;
    const row = await client.deliveryRule.update({
      where: { id: rule.id },
      data: this.toPrisma(rule),
    });
    return this.toDomain(row);
  }

  async deleteById(id: string, tx?: PrismaTransaction): Promise<void> {
    const client = tx ?? this.prisma;
    await client.deliveryRule.delete({ where: { id } });
  }

  private toDomain(row: {
    id: string;
    name: string;
    minimumOrderAmount: Prisma.Decimal;
    deliveryFee: Prisma.Decimal;
    isFreeDelivery: boolean;
    status: 'ACTIVE' | 'INACTIVE';
    priority: number;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): DeliveryRule {
    return DeliveryRule.rehydrate({
      id: row.id,
      name: row.name,
      minimumOrderAmount: Number(row.minimumOrderAmount),
      deliveryFee: Number(row.deliveryFee),
      isFreeDelivery: row.isFreeDelivery,
      status: row.status as DeliveryRuleStatus,
      priority: row.priority,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toPrisma(rule: DeliveryRule) {
    return {
      name: rule.name,
      minimumOrderAmount: rule.minimumOrderAmount,
      deliveryFee: rule.deliveryFee,
      isFreeDelivery: rule.isFreeDelivery,
      status: rule.status,
      priority: rule.priority,
      description: rule.description ?? null,
      updatedAt: rule.updatedAt,
    };
  }
}
