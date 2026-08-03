import { Injectable } from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  ProductStatus,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { DashboardPeriod } from '../domain/enums/dashboard-period.enum';
import { DashboardFilter } from '../domain/types/dashboard-filter.types';
import {
  getTodayRange,
  getYesterdayRange,
  resolveDashboardDateRange,
} from '../utils/dashboard-date.util';

const LOW_STOCK_THRESHOLD = 20;
const CRITICAL_STOCK_THRESHOLD = 5;

const REVENUE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildOrderWhere(
    filter: DashboardFilter,
    range?: { start: Date; end: Date },
  ): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};

    if (range) {
      where.createdAt = { gte: range.start, lte: range.end };
    }

    if (filter.outletId) {
      where.outletId = filter.outletId;
    }

    if (filter.orderStatus) {
      where.status = filter.orderStatus as OrderStatus;
    }

    if (filter.productId || filter.categoryId) {
      where.items = {
        some: {
          ...(filter.productId ? { productId: filter.productId } : {}),
          ...(filter.categoryId
            ? { product: { categoryId: filter.categoryId } }
            : {}),
        },
      };
    }

    return where;
  }

  private buildPaymentWhere(
    filter: DashboardFilter,
    range?: { start: Date; end: Date },
  ): Prisma.PaymentWhereInput {
    const where: Prisma.PaymentWhereInput = {};

    if (range) {
      where.createdAt = { gte: range.start, lte: range.end };
    }

    if (filter.paymentStatus) {
      where.status = filter.paymentStatus as PaymentStatus;
    }

    if (
      filter.outletId ||
      filter.orderStatus ||
      filter.productId ||
      filter.categoryId
    ) {
      where.order = this.buildOrderWhere(filter);
      if (range) {
        delete (where.order as Prisma.OrderWhereInput).createdAt;
      }
    }

    return where;
  }

  private toNumber(value: Prisma.Decimal | number | null | undefined): number {
    if (value == null) return 0;
    return typeof value === 'number' ? value : Number(value);
  }

  async getOrderStatusCounts(
    filter: DashboardFilter,
    range: { start: Date; end: Date },
  ) {
    const rows = await this.prisma.order.groupBy({
      by: ['status'],
      where: this.buildOrderWhere(filter, range),
      _count: { _all: true },
    });

    const map: Record<string, number> = {};
    for (const row of rows) {
      map[row.status] = row._count._all;
    }
    return map;
  }

  async getPaymentStatusCounts(
    filter: DashboardFilter,
    range: { start: Date; end: Date },
  ) {
    const rows = await this.prisma.payment.groupBy({
      by: ['status'],
      where: this.buildPaymentWhere(filter, range),
      _count: { _all: true },
    });

    const map: Record<string, number> = {};
    for (const row of rows) {
      map[row.status] = row._count._all;
    }
    return map;
  }

  async getRevenueAggregate(
    filter: DashboardFilter,
    range: { start: Date; end: Date },
  ) {
    const where: Prisma.OrderWhereInput = {
      ...this.buildOrderWhere(filter, range),
      status: { in: REVENUE_ORDER_STATUSES },
    };

    const aggregate = await this.prisma.order.aggregate({
      where,
      _sum: {
        grandTotal: true,
        deliveryFee: true,
        discount: true,
        subtotal: true,
        afterDiscountTotal: true,
      },
      _count: { _all: true },
      _avg: {
        grandTotal: true,
        itemCount: true,
      },
    });

    return {
      revenue: this.toNumber(aggregate._sum.grandTotal),
      deliveryCharges: this.toNumber(aggregate._sum.deliveryFee),
      discount: this.toNumber(aggregate._sum.discount),
      productRevenue: this.toNumber(aggregate._sum.afterDiscountTotal),
      grossRevenue: this.toNumber(aggregate._sum.subtotal),
      netRevenue: this.toNumber(aggregate._sum.grandTotal),
      orderCount: aggregate._count._all,
      averageOrderValue: this.toNumber(aggregate._avg.grandTotal),
      averageBasketSize: this.toNumber(aggregate._avg.itemCount),
    };
  }

  async getPaymentAggregate(
    filter: DashboardFilter,
    range: { start: Date; end: Date },
  ) {
    const baseWhere = this.buildPaymentWhere(filter, range);

    const [success, failed, pending, refunded, total] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { ...baseWhere, status: PaymentStatus.SUCCESS },
        _sum: { amount: true, paidAmount: true },
        _count: { _all: true },
      }),
      this.prisma.payment.count({
        where: { ...baseWhere, status: PaymentStatus.FAILED },
      }),
      this.prisma.payment.count({
        where: { ...baseWhere, status: PaymentStatus.INITIATED },
      }),
      this.prisma.payment.count({
        where: { ...baseWhere, status: PaymentStatus.REFUNDED },
      }),
      this.prisma.payment.count({ where: baseWhere }),
    ]);

    const successful = success._count._all;
    const successRate =
      total > 0 ? Number(((successful / total) * 100).toFixed(2)) : 0;

    return {
      successfulPayments: successful,
      failedPayments: failed,
      pendingPayments: pending,
      refundedPayments: refunded,
      totalPayments: total,
      paymentSuccessRate: successRate,
      successfulAmount: this.toNumber(
        success._sum.paidAmount ?? success._sum.amount,
      ),
    };
  }

  async getCustomerMetrics(
    filter: DashboardFilter,
    range: { start: Date; end: Date },
  ) {
    const orderWhere = {
      ...this.buildOrderWhere(filter, range),
      status: { in: REVENUE_ORDER_STATUSES },
    };

    const [totalCustomers, newCustomers, orderGroups] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({
        where: { createdAt: { gte: range.start, lte: range.end } },
      }),
      this.prisma.order.groupBy({
        by: ['customerId'],
        where: orderWhere,
        _count: { _all: true },
        _sum: { grandTotal: true },
      }),
    ]);

    const returningCustomers = orderGroups.filter(
      (g) => g._count._all > 1,
    ).length;
    const repeatPurchaseRate =
      orderGroups.length > 0
        ? Number(((returningCustomers / orderGroups.length) * 100).toFixed(2))
        : 0;

    const averageSpend =
      orderGroups.length > 0
        ? orderGroups.reduce(
            (sum, g) => sum + this.toNumber(g._sum.grandTotal),
            0,
          ) / orderGroups.length
        : 0;

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      registeredCustomers: totalCustomers,
      guestCustomers: 0,
      repeatPurchaseRate,
      averageSpend: Number(averageSpend.toFixed(2)),
    };
  }

  async getCatalogMetrics() {
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      unavailableProducts,
      totalCategories,
      totalOutlets,
      activeOutlets,
      inactiveOutlets,
    ] = await Promise.all([
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.product.count({
        where: {
          deletedAt: null,
          status: ProductStatus.ACTIVE,
          isAvailable: true,
        },
      }),
      this.prisma.product.count({
        where: { deletedAt: null, status: ProductStatus.INACTIVE },
      }),
      this.prisma.product.count({
        where: { deletedAt: null, isAvailable: false },
      }),
      this.prisma.category.count(),
      this.prisma.outlet.count(),
      this.prisma.outlet.count({ where: { status: 'ACTIVE' } }),
      this.prisma.outlet.count({ where: { status: 'INACTIVE' } }),
    ]);

    const [lowStockItems, outOfStockItems] = await Promise.all([
      this.prisma.centralInventory.count({
        where: {
          availableQty: { gt: 0, lte: LOW_STOCK_THRESHOLD },
          status: 'ACTIVE',
        },
      }),
      this.prisma.centralInventory.count({
        where: { availableQty: { lte: 0 }, status: 'ACTIVE' },
      }),
    ]);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts,
      outOfStockProducts: unavailableProducts,
      lowStockProducts: lowStockItems,
      totalCategories,
      totalBrands: 0,
      totalOutlets,
      activeOutlets,
      inactiveOutlets,
      outOfStockInventoryItems: outOfStockItems,
    };
  }

  async getDeliveryMetrics(
    filter: DashboardFilter,
    range: { start: Date; end: Date },
  ) {
    const delivered = await this.prisma.order.findMany({
      where: {
        ...this.buildOrderWhere(filter, range),
        deliveredAt: { not: null },
      },
      select: { createdAt: true, deliveredAt: true },
    });

    const durations = delivered
      .filter((o) => o.deliveredAt)
      .map((o) => o.deliveredAt.getTime() - o.createdAt.getTime());

    const avgMs =
      durations.length > 0
        ? durations.reduce((sum, ms) => sum + ms, 0) / durations.length
        : 0;
    const fastestMs = durations.length > 0 ? Math.min(...durations) : 0;

    const [confirmedCount, deliveredCount, cancelledCount, paidCount] =
      await Promise.all([
        this.prisma.order.count({
          where: {
            ...this.buildOrderWhere(filter, range),
            confirmedAt: { not: null },
          },
        }),
        this.prisma.order.count({
          where: {
            ...this.buildOrderWhere(filter, range),
            status: OrderStatus.DELIVERED,
          },
        }),
        this.prisma.order.count({
          where: {
            ...this.buildOrderWhere(filter, range),
            status: OrderStatus.CANCELLED,
          },
        }),
        this.prisma.order.count({
          where: {
            ...this.buildOrderWhere(filter, range),
            status: OrderStatus.PAID,
          },
        }),
      ]);

    return {
      averageDeliveryMinutes: Number((avgMs / 60000).toFixed(1)),
      fastestDeliveryMinutes: Number((fastestMs / 60000).toFixed(1)),
      delayedDeliveries: 0,
      completedDeliveries: deliveredCount,
      cancelledDeliveries: cancelledCount,
      acceptanceRate:
        paidCount + confirmedCount > 0
          ? Number(
              ((confirmedCount / (paidCount + confirmedCount)) * 100).toFixed(
                2,
              ),
            )
          : 0,
      completionRate:
        confirmedCount > 0
          ? Number(((deliveredCount / confirmedCount) * 100).toFixed(2))
          : 0,
    };
  }

  async getDailyTrend(
    filter: DashboardFilter,
    range: { start: Date; end: Date },
  ) {
    const orders = await this.prisma.order.findMany({
      where: {
        ...this.buildOrderWhere(filter, range),
        status: { in: REVENUE_ORDER_STATUSES },
      },
      select: { createdAt: true, grandTotal: true },
      orderBy: { createdAt: 'asc' },
    });

    const bucket = new Map<string, { revenue: number; orders: number }>();
    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      const current = bucket.get(key) ?? { revenue: 0, orders: 0 };
      current.revenue += this.toNumber(order.grandTotal);
      current.orders += 1;
      bucket.set(key, current);
    }

    return Array.from(bucket.entries()).map(([date, value]) => ({
      date,
      revenue: Number(value.revenue.toFixed(2)),
      orders: value.orders,
    }));
  }

  async getTopProducts(
    filter: DashboardFilter,
    range: { start: Date; end: Date },
    limit = 10,
  ) {
    const items = await this.prisma.orderItem.groupBy({
      by: ['productId', 'productName', 'productImage'],
      where: {
        order: {
          ...this.buildOrderWhere(filter, range),
          status: { in: REVENUE_ORDER_STATUSES },
        },
      },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: limit,
    });

    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        slug: true,
        mainImage: true,
        galleryImages: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: { imageUrl: true },
        },
        category: { select: { name: true } },
        isAvailable: true,
      },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return items.map((item) => {
      const product = productMap.get(item.productId);
      return {
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        mainImage: product?.mainImage ?? null,
        galleryImageKeys:
          product?.galleryImages.map((image) => image.imageUrl) ?? [],
        sku: product?.slug ?? item.productId.slice(0, 8).toUpperCase(),
        category: product?.category.name ?? 'Uncategorized',
        unitsSold: item._sum.quantity ?? 0,
        revenue: this.toNumber(item._sum.totalPrice),
        currentStock: product?.isAvailable ? 'Available' : 'Unavailable',
        trend: 'up',
        growthPercent: 0,
      };
    });
  }

  async getTopCategories(
    filter: DashboardFilter,
    range: { start: Date; end: Date },
    limit = 10,
  ) {
    const rows = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          ...this.buildOrderWhere(filter, range),
          status: { in: REVENUE_ORDER_STATUSES },
        },
      },
      _sum: { quantity: true, totalPrice: true },
    });

    const products = await this.prisma.product.findMany({
      where: { id: { in: rows.map((r) => r.productId) } },
      select: {
        id: true,
        categoryId: true,
        category: { select: { name: true } },
      },
    });

    const categoryMap = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        revenue: number;
        orders: number;
        units: number;
      }
    >();

    for (const row of rows) {
      const product = products.find((p) => p.id === row.productId);
      if (!product) continue;

      const current = categoryMap.get(product.categoryId) ?? {
        categoryId: product.categoryId,
        categoryName: product.category.name,
        revenue: 0,
        orders: 0,
        units: 0,
      };
      current.revenue += this.toNumber(row._sum.totalPrice);
      current.units += row._sum.quantity ?? 0;
      current.orders += 1;
      categoryMap.set(product.categoryId, current);
    }

    return Array.from(categoryMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
      .map((item) => ({
        ...item,
        revenue: Number(item.revenue.toFixed(2)),
        growthPercent: 0,
        mostViewed: 0,
      }));
  }

  async getTopOutlets(
    filter: DashboardFilter,
    range: { start: Date; end: Date },
    limit = 10,
  ) {
    const rows = await this.prisma.order.groupBy({
      by: ['outletId'],
      where: {
        ...this.buildOrderWhere(filter, range),
        status: { in: REVENUE_ORDER_STATUSES },
      },
      _sum: { grandTotal: true },
      _count: { _all: true },
      orderBy: { _sum: { grandTotal: 'desc' } },
      take: limit,
    });

    const outlets = await this.prisma.outlet.findMany({
      where: { id: { in: rows.map((r) => r.outletId) } },
      select: { id: true, name: true },
    });
    const outletMap = new Map(outlets.map((o) => [o.id, o.name]));

    return rows.map((row) => ({
      outletId: row.outletId,
      outletName: outletMap.get(row.outletId) ?? 'Unknown Outlet',
      revenue: this.toNumber(row._sum.grandTotal),
      orders: row._count._all,
      customers: 0,
      averageDeliveryMinutes: 0,
      completionRate: 0,
      acceptanceRate: 0,
    }));
  }

  async getTopCustomers(
    filter: DashboardFilter,
    range: { start: Date; end: Date },
    limit = 10,
  ) {
    const rows = await this.prisma.order.groupBy({
      by: ['customerId'],
      where: {
        ...this.buildOrderWhere(filter, range),
        status: { in: REVENUE_ORDER_STATUSES },
      },
      _sum: { grandTotal: true },
      _count: { _all: true },
      orderBy: { _sum: { grandTotal: 'desc' } },
      take: limit,
    });

    const customers = await this.prisma.customer.findMany({
      where: { id: { in: rows.map((r) => r.customerId) } },
      select: {
        id: true,
        phone: true,
        profile: { select: { fullName: true } },
      },
    });
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    return rows.map((row) => {
      const customer = customerMap.get(row.customerId);
      return {
        customerId: row.customerId,
        customerName: customer?.profile?.fullName ?? 'Customer',
        phone: customer?.phone ?? '',
        orders: row._count._all,
        lifetimeValue: this.toNumber(row._sum.grandTotal),
      };
    });
  }

  async getRecentOrders(filter: DashboardFilter, limit = 10) {
    const range = resolveDashboardDateRange(filter);
    const orders = await this.prisma.order.findMany({
      where: this.buildOrderWhere(filter, range),
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        customer: {
          select: { phone: true, profile: { select: { fullName: true } } },
        },
        outlet: { select: { name: true } },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { status: true },
        },
        items: { select: { id: true } },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer.profile?.fullName ?? 'Customer',
      customerPhone: order.customer.phone,
      outletName: order.outlet.name,
      itemCount: order.items.length,
      paymentStatus: order.payments[0]?.status ?? 'INITIATED',
      orderStatus: order.status,
      amount: this.toNumber(order.grandTotal),
      createdAt: order.createdAt,
    }));
  }

  async getRecentPayments(filter: DashboardFilter, limit = 10) {
    const range = resolveDashboardDateRange(filter);
    const payments = await this.prisma.payment.findMany({
      where: this.buildPaymentWhere(filter, range),
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        order: {
          select: {
            orderNumber: true,
            customer: {
              select: { phone: true, profile: { select: { fullName: true } } },
            },
          },
        },
      },
    });

    return payments.map((payment) => ({
      id: payment.id,
      transactionId: payment.transactionId,
      gateway: payment.provider ?? 'ONLINE',
      amount: this.toNumber(payment.amount),
      status: payment.status,
      attemptNo: payment.attemptNo,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
      customerName: payment.order.customer.profile?.fullName ?? 'Customer',
      customerPhone: payment.order.customer.phone,
      orderNumber: payment.order.orderNumber,
    }));
  }

  async getLowStockItems(limit = 20) {
    const rows = await this.prisma.centralInventory.findMany({
      where: { status: 'ACTIVE', availableQty: { lte: LOW_STOCK_THRESHOLD } },
      orderBy: { availableQty: 'asc' },
      take: limit,
      include: {
        stockItem: {
          select: { id: true, name: true, unit: true, status: true },
        },
      },
    });

    return rows.map((row) => {
      const qty = this.toNumber(row.availableQty);
      let level: 'CRITICAL' | 'LOW' | 'OUT_OF_STOCK' = 'LOW';
      if (qty <= 0) level = 'OUT_OF_STOCK';
      else if (qty <= CRITICAL_STOCK_THRESHOLD) level = 'CRITICAL';

      return {
        stockItemId: row.stockItemId,
        name: row.stockItem.name,
        unit: row.stockItem.unit,
        availableQty: qty,
        totalQty: this.toNumber(row.totalQty),
        level,
        status: row.stockItem.status,
      };
    });
  }

  async getPeriodRevenueSnapshots(filter: DashboardFilter) {
    const mainRange = resolveDashboardDateRange(filter);
    const today = getTodayRange();
    const yesterday = getYesterdayRange();

    const [todayAgg, yesterdayAgg, weeklyAgg, monthlyAgg, yearlyAgg, mainAgg] =
      await Promise.all([
        this.getRevenueAggregate(filter, today),
        this.getRevenueAggregate(filter, yesterday),
        this.getRevenueAggregate(
          filter,
          resolveDashboardDateRange({ period: DashboardPeriod.LAST_7_DAYS }),
        ),
        this.getRevenueAggregate(
          filter,
          resolveDashboardDateRange({ period: DashboardPeriod.THIS_MONTH }),
        ),
        this.getRevenueAggregate(
          filter,
          resolveDashboardDateRange({ period: DashboardPeriod.THIS_YEAR }),
        ),
        this.getRevenueAggregate(filter, mainRange),
      ]);

    return {
      range: mainRange,
      today: todayAgg,
      yesterday: yesterdayAgg,
      weekly: weeklyAgg,
      monthly: monthlyAgg,
      yearly: yearlyAgg,
      filtered: mainAgg,
    };
  }
}
