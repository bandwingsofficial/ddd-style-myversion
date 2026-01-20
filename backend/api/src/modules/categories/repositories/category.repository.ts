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
        subtitle: category.subtitle ?? null,     // ✅ ADDED
        imagePath: category.imagePath ?? null,   // ✅ ADDED
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
  /* READ (BY NAME – CASE INSENSITIVE)                 */
  /* ================================================= */

  async findByName(
    name: string,
    tx?: PrismaTransaction,
  ): Promise<Category | null> {
    const row = await (tx ?? this.prisma).category.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    return row ? this.toDomain(row) : null;
  }

  /* ================================================= */
  /* READ (LIST – ADMIN & CUSTOMER)                    */
  /* ================================================= */

  async findAll(
    includeInactive = false,
    tx?: PrismaTransaction,
  ): Promise<Category[]> {
    const client = tx ?? this.prisma;

    const activeRows = await client.category.findMany({
      where: {
        status: CategoryStatusMapper.toPrisma(
          CategoryStatus.ACTIVE,
        ),
      },
      orderBy: { sortOrder: 'asc' },
    });

    const active = activeRows.map((row) =>
      this.toDomain(row),
    );

    if (!includeInactive) {
      return active;
    }

    const inactiveRows = await client.category.findMany({
      where: {
        status: CategoryStatusMapper.toPrisma(
          CategoryStatus.INACTIVE,
        ),
      },
      orderBy: { updatedAt: 'desc' },
    });

    const inactive = inactiveRows.map((row) =>
      this.toDomain(row),
    );

    return [...active, ...inactive];
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
        subtitle: category.subtitle ?? null,     // ✅ ADDED
        imagePath: category.imagePath ?? null,   // ✅ ADDED
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
    if (tx) {
      return this.updateStatusInternal(category, tx);
    }

    return this.prisma.$transaction((trx) =>
      this.updateStatusInternal(category, trx),
    );
  }

  private async updateStatusInternal(
    category: Category,
    trx: PrismaTransaction,
  ): Promise<Category> {
    const existing = await trx.category.findUnique({
      where: { id: category.id },
    });

    if (!existing) {
      throw new Error('Category not found');
    }

    const existingStatus =
      CategoryStatusMapper.toDomain(existing.status);

    if (existingStatus === category.status) {
      return this.toDomain(existing);
    }

    /* ACTIVE → INACTIVE */
    if (
      existingStatus === CategoryStatus.ACTIVE &&
      category.status === CategoryStatus.INACTIVE
    ) {
      await trx.category.updateMany({
        where: {
          status: CategoryStatusMapper.toPrisma(
            CategoryStatus.ACTIVE,
          ),
          sortOrder: { gt: existing.sortOrder },
        },
        data: {
          sortOrder: { decrement: 1 },
        },
      });

      const row = await trx.category.update({
        where: { id: category.id },
        data: {
          status: CategoryStatusMapper.toPrisma(
            CategoryStatus.INACTIVE,
          ),
          updatedAt: category.updatedAt,
        },
      });

      return this.toDomain(row);
    }

    /* INACTIVE → ACTIVE */
    if (
      existingStatus === CategoryStatus.INACTIVE &&
      category.status === CategoryStatus.ACTIVE
    ) {
      const lastActive = await trx.category.findFirst({
        where: {
          status: CategoryStatusMapper.toPrisma(
            CategoryStatus.ACTIVE,
          ),
        },
        orderBy: { sortOrder: 'desc' },
      });

      const nextSortOrder = lastActive
        ? lastActive.sortOrder + 1
        : 0;

      const row = await trx.category.update({
        where: { id: category.id },
        data: {
          status: CategoryStatusMapper.toPrisma(
            CategoryStatus.ACTIVE,
          ),
          sortOrder: nextSortOrder,
          updatedAt: category.updatedAt,
        },
      });

      return this.toDomain(row);
    }

    return this.toDomain(existing);
  }

  /* ================================================= */
  /* SORT ORDER (ACTIVE ONLY – DOMAIN GUARDED)         */
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
  /* SORT ORDER – NORMALIZE (ACTIVE ONLY)              */
  /* ================================================= */

  async normalizeActiveSortOrders(
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    const active = await client.category.findMany({
      where: {
        status: CategoryStatusMapper.toPrisma(
          CategoryStatus.ACTIVE,
        ),
      },
      orderBy: { sortOrder: 'asc' },
    });

    for (let i = 0; i < active.length; i++) {
      if (active[i].sortOrder !== i) {
        await client.category.update({
          where: { id: active[i].id },
          data: { sortOrder: i },
        });
      }
    }
  }

  /* ================================================= */
  /* SORT ORDER – SHIFT (ACTIVE ONLY)                  */
  /* ================================================= */

  async shiftActiveSortOrdersFrom(
    sortOrder: number,
    tx?: PrismaTransaction,
  ): Promise<void> {
    const client = tx ?? this.prisma;

    await client.category.updateMany({
      where: {
        status: CategoryStatusMapper.toPrisma(
          CategoryStatus.ACTIVE,
        ),
        sortOrder: { gte: sortOrder },
      },
      data: {
        sortOrder: { increment: 1 },
      },
    });
  }

  /* ================================================= */
  /* PRIVATE MAPPER                                   */
  /* ================================================= */

  private toDomain(row: {
    id: string;
    name: string;
    subtitle: string | null;
    imagePath: string | null;
    status: any;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }): Category {
    return Category.rehydrate({
      id: row.id,
      name: row.name,
      subtitle: row.subtitle ?? undefined,
      imagePath: row.imagePath ?? undefined,
      status: CategoryStatusMapper.toDomain(row.status),
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
