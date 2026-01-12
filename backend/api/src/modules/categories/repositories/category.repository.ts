// src/modules/categories/repositories/category.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Category } from '../domain/models/category.model';
import { CategoryStatus } from '../domain/enums/category-status.enum';
import { CategoryStatusMapper } from '../mappers/category-status.mapper';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* ================================================= */
  /* CREATE                                           */
  /* ================================================= */

  async create(
    category: Category,
    tx?: PrismaTransaction,
  ): Promise<Category> {
    const client = tx ?? this.prisma;

    const row = await client.category.create({
      data: {
        id: category.id,
        name: category.name,
        status: CategoryStatusMapper.toPrisma(category.status),
        sortOrder: category.sortOrder,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* READ (SINGLE)                                    */
  /* ================================================= */

  async findById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<Category | null> {
    const row = await (tx ?? this.prisma).category.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  async existsById(
    id: string,
    tx?: PrismaTransaction,
  ): Promise<boolean> {
    const category = await (tx ?? this.prisma).category.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!category;
  }

  /* ================================================= */
  /* READ (LIST – ADMIN & CUSTOMER)                   */
  /* ================================================= */

  /**
   * includeInactive:
   *  - false → customer / public
   *  - true  → admin
   */
  async findAll(
    includeInactive = false,
    tx?: PrismaTransaction,
  ): Promise<Category[]> {
    const rows = await (tx ?? this.prisma).category.findMany({
      where: includeInactive
        ? undefined
        : {
            status: CategoryStatusMapper.toPrisma(
              CategoryStatus.ACTIVE,
            ),
          },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return rows.map((row) => this.toDomain(row));
  }

  /* ================================================= */
  /* UPDATE (FULL AGGREGATE)                           */
  /* ================================================= */

  async update(
    category: Category,
    tx?: PrismaTransaction,
  ): Promise<Category> {
    const client = tx ?? this.prisma;

    const row = await client.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        status: CategoryStatusMapper.toPrisma(category.status),
        sortOrder: category.sortOrder,
        updatedAt: category.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* STATUS (ENABLE / DISABLE)                         */
  /* ================================================= */

  async updateStatus(
    category: Category,
    tx?: PrismaTransaction,
  ): Promise<Category> {
    const client = tx ?? this.prisma;

    const row = await client.category.update({
      where: { id: category.id },
      data: {
        status: CategoryStatusMapper.toPrisma(category.status),
        updatedAt: category.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* SORT ORDER                                       */
  /* ================================================= */

  async updateSortOrder(
    category: Category,
    tx?: PrismaTransaction,
  ): Promise<Category> {
    const client = tx ?? this.prisma;

    const row = await client.category.update({
      where: { id: category.id },
      data: {
        sortOrder: category.sortOrder,
        updatedAt: category.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  /* ================================================= */
  /* PRIVATE MAPPER                                   */
  /* ================================================= */

  private toDomain(row: {
    id: string;
    name: string;
    status: any;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }): Category {
    return Category.rehydrate({
      id: row.id,
      name: row.name,
      status: CategoryStatusMapper.toDomain(row.status),
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
