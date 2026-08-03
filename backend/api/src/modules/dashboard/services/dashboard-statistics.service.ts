import { Injectable } from '@nestjs/common';

import { DashboardFilter } from '../domain/types/dashboard-filter.types';
import { resolveDashboardDateRange } from '../utils/dashboard-date.util';
import { DashboardRepository } from '../repositories/dashboard.repository';

@Injectable()
export class DashboardStatisticsService {
  constructor(private readonly repo: DashboardRepository) {}

  async buildSummary(filter: DashboardFilter) {
    const range = resolveDashboardDateRange(filter);

    const [
      snapshots,
      orderStatusCounts,
      paymentMetrics,
      customerMetrics,
      catalogMetrics,
      deliveryMetrics,
    ] = await Promise.all([
      this.repo.getPeriodRevenueSnapshots(filter),
      this.repo.getOrderStatusCounts(filter, range),
      this.repo.getPaymentAggregate(filter, range),
      this.repo.getCustomerMetrics(filter, range),
      this.repo.getCatalogMetrics(),
      this.repo.getDeliveryMetrics(filter, range),
    ]);

    const totalOrders = Object.values(orderStatusCounts).reduce(
      (sum, n) => sum + n,
      0,
    );

    return {
      filters: {
        period: filter.period ?? 'LAST_7_DAYS',
        startDate: range.start,
        endDate: range.end,
        label: range.label,
      },
      revenue: {
        totalRevenue: snapshots.filtered.revenue,
        todaysRevenue: snapshots.today.revenue,
        yesterdayRevenue: snapshots.yesterday.revenue,
        weeklyRevenue: snapshots.weekly.revenue,
        monthlyRevenue: snapshots.monthly.revenue,
        yearlyRevenue: snapshots.yearly.revenue,
        productRevenue: snapshots.filtered.productRevenue,
        deliveryChargesCollected: snapshots.filtered.deliveryCharges,
        discountGiven: snapshots.filtered.discount,
        couponDiscount: 0,
        tax: 0,
        netRevenue: snapshots.filtered.netRevenue,
        grossRevenue: snapshots.filtered.grossRevenue,
      },
      orders: {
        totalOrders,
        todaysOrders: snapshots.today.orderCount,
        pendingOrders:
          (orderStatusCounts.PAYMENT_PENDING ?? 0) +
          (orderStatusCounts.PAID ?? 0),
        confirmedOrders: orderStatusCounts.CONFIRMED ?? 0,
        preparingOrders: orderStatusCounts.PREPARING ?? 0,
        readyOrders: orderStatusCounts.PREPARING ?? 0,
        outForDelivery: orderStatusCounts.OUT_FOR_DELIVERY ?? 0,
        deliveredOrders: orderStatusCounts.DELIVERED ?? 0,
        cancelledOrders: orderStatusCounts.CANCELLED ?? 0,
        rejectedOrders: 0,
        refundedOrders: paymentMetrics.refundedPayments,
        returnedOrders: 0,
        averageOrderValue: snapshots.filtered.averageOrderValue,
        averageBasketSize: snapshots.filtered.averageBasketSize,
      },
      payments: {
        todaysPayments: paymentMetrics.totalPayments,
        successfulPayments: paymentMetrics.successfulPayments,
        failedPayments: paymentMetrics.failedPayments,
        pendingPayments: paymentMetrics.pendingPayments,
        paymentSuccessRate: paymentMetrics.paymentSuccessRate,
      },
      customers: customerMetrics,
      catalog: catalogMetrics,
      delivery: deliveryMetrics,
    };
  }
}
