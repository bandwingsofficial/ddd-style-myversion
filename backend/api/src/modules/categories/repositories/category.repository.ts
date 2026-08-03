import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PrismaTransaction } from '../../../infrastructure/prisma/prisma.types';

import { Category } from '../domain/models/category.model';
import { CategoryStatus } from '../domain/enums/category-status.enum';
import { CategoryStatusMapper } from '../mappers/category-status.mapper';

export interface PaginatedCategories {
  items: Category[];
  total: number;
}

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(category: Category, tx?: PrismaTransaction): Promise<Category> {
    const client = tx ?? this.prisma;

    const row = await client.category.create({
      data: {
        id: category.id,
        name: category.name,
        subtitle: category.subtitle ?? null,
        imagePath: category.imagePath ?? null,
        status: CategoryStatusMapper.toPrisma(category.status),
        sortOrder: category.sortOrder,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  async findById(id: string, tx?: PrismaTransaction): Promise<Category | null> {
    const row = await (tx ?? this.prisma).category.findUnique({
      where: { id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByName(
    name: string,
    tx?: PrismaTransaction,
    excludeId?: string,
  ): Promise<Category | null> {
    const row = await (tx ?? this.prisma).category.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    return row ? this.toDomain(row) : null;
  }

  async findAll(
    includeInactive = false,
    tx?: PrismaTransaction,
  ): Promise<Category[]> {
    const client = tx ?? this.prisma;

    const activeRows = await client.category.findMany({
      where: {
        status: CategoryStatusMapper.toPrisma(CategoryStatus.ACTIVE),
      },
      orderBy: { sortOrder: 'asc' },
    });

    const active = activeRows.map((row) => this.toDomain(row));

    if (!includeInactive) {
      return active;
    }

    const inactiveRows = await client.category.findMany({
      where: {
        status: CategoryStatusMapper.toPrisma(CategoryStatus.INACTIVE),
      },
      orderBy: { updatedAt: 'desc' },
    });

    return [...active, ...inactiveRows.map((row) => this.toDomain(row))];
  }

  async findPaginated(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<PaginatedCategories> {
    const where = this.buildSearchWhere(params.search);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        orderBy: [
          { status: 'asc' },
          { sortOrder: 'asc' },
          { updatedAt: 'desc' },
        ],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.toDomain(row)),
      total,
    };
  }

  async countActive(tx?: PrismaTransaction): Promise<number> {
    return (tx ?? this.prisma).category.count({
      where: {
        status: CategoryStatusMapper.toPrisma(CategoryStatus.ACTIVE),
      },
    });
  }

  async findActiveCategories(tx?: PrismaTransaction): Promise<Category[]> {
    const rows = await (tx ?? this.prisma).category.findMany({
      where: {
        status: CategoryStatusMapper.toPrisma(CategoryStatus.ACTIVE),
      },
      orderBy: { sortOrder: 'asc' },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async getNextActiveSortOrder(tx?: PrismaTransaction): Promise<number> {
    const client = tx ?? this.prisma;

    const lastActive = await client.category.findFirst({
      where: {
        status: CategoryStatusMapper.toPrisma(CategoryStatus.ACTIVE),
      },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    return lastActive ? lastActive.sortOrder + 1 : 1;
  }

  async countProductsByCategoryId(
    categoryId: string,
    tx?: PrismaTransaction,
  ): Promise<number> {
    return (tx ?? this.prisma).product.count({
      where: { categoryId },
    });
  }

  async update(category: Category, tx?: PrismaTransaction): Promise<Category> {
    const client = tx ?? this.prisma;

    const row = await client.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        subtitle: category.subtitle ?? null,
        imagePath: category.imagePath ?? null,
        status: CategoryStatusMapper.toPrisma(category.status),
        sortOrder: category.sortOrder,
        updatedAt: category.updatedAt,
      },
    });

    return this.toDomain(row);
  }

  async updateStatusOnly(
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

  async updateSortOrders(
    items: { id: string; sortOrder: number }[],
    tx: PrismaTransaction,
  ): Promise<void> {
    await Promise.all(
      items.map((item) =>
        tx.category.update({
          where: { id: item.id },
          data: {
            sortOrder: item.sortOrder,
            updatedAt: new Date(),
          },
        }),
      ),
    );
  }

  async normalizeActiveSortOrders(tx?: PrismaTransaction): Promise<void> {
    const client = tx ?? this.prisma;

    const active = await client.category.findMany({
      where: {
        status: CategoryStatusMapper.toPrisma(CategoryStatus.ACTIVE),
      },
      orderBy: { sortOrder: 'asc' },
    });

    for (let index = 0; index < active.length; index++) {
      const nextSortOrder = index + 1;

      if (active[index].sortOrder !== nextSortOrder) {
        await client.category.update({
          where: { id: active[index].id },
          data: { sortOrder: nextSortOrder },
        });
      }
    }
  }

  async deleteById(categoryId: string, tx?: PrismaTransaction): Promise<void> {
    await (tx ?? this.prisma).category.delete({
      where: { id: categoryId },
    });
  }

  private buildSearchWhere(
    search?: string,
  ): Prisma.CategoryWhereInput | undefined {
    const trimmed = search?.trim();

    if (!trimmed) {
      return undefined;
    }

    return {
      OR: [
        {
          name: {
            contains: trimmed,
            mode: 'insensitive',
          },
        },
        {
          subtitle: {
            contains: trimmed,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

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
