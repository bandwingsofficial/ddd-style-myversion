import { Injectable } from '@nestjs/common';

import { DashboardFilter } from '../domain/types/dashboard-filter.types';
import { resolveDashboardDateRange } from '../utils/dashboard-date.util';
import { DashboardRepository } from '../repositories/dashboard.repository';

@Injectable()
export class DashboardAnalyticsService {
  constructor(private readonly repo: DashboardRepository) {}

  async getRevenueAnalytics(filter: DashboardFilter) {
    const range = resolveDashboardDateRange(filter);
    const trend = await this.repo.getDailyTrend(filter, range);
    const snapshots = await this.repo.getPeriodRevenueSnapshots(filter);

    return {
      range,
      trend,
      totals: snapshots.filtered,
      hourly: [],
      weekly: trend,
      monthly: trend,
      yearly: trend,
    };
  }

  async getOrderAnalytics(filter: DashboardFilter) {
    const range = resolveDashboardDateRange(filter);
    const [statusCounts, trend] = await Promise.all([
      this.repo.getOrderStatusCounts(filter, range),
      this.repo.getDailyTrend(filter, range),
    ]);

    return {
      range,
      statusCounts,
      trend: trend.map((point) => ({ date: point.date, orders: point.orders })),
      cancellationTrend: [],
      averageOrderValueTrend: trend.map((point) => ({
        date: point.date,
        value: point.orders > 0 ? Number((point.revenue / point.orders).toFixed(2)) : 0,
      })),
    };
  }

  async getPaymentAnalytics(filter: DashboardFilter) {
    const range = resolveDashboardDateRange(filter);
    const [statusCounts, aggregate] = await Promise.all([
      this.repo.getPaymentStatusCounts(filter, range),
      this.repo.getPaymentAggregate(filter, range),
    ]);

    return {
      range,
      statusCounts,
      aggregate,
      trend: [],
    };
  }

  async getCustomerAnalytics(filter: DashboardFilter) {
    const range = resolveDashboardDateRange(filter);
    const [metrics, topCustomers] = await Promise.all([
      this.repo.getCustomerMetrics(filter, range),
      this.repo.getTopCustomers(filter, range, 10),
    ]);

    return { range, metrics, topCustomers, growthTrend: [] };
  }

  async getProductAnalytics(filter: DashboardFilter, limit = 10) {
    const range = resolveDashboardDateRange(filter);
    const topProducts = await this.repo.getTopProducts(filter, range, limit);
    return { range, topProducts };
  }

  async getCategoryAnalytics(filter: DashboardFilter, limit = 10) {
    const range = resolveDashboardDateRange(filter);
    const topCategories = await this.repo.getTopCategories(filter, range, limit);
    return { range, topCategories };
  }

  async getOutletAnalytics(filter: DashboardFilter, limit = 10) {
    const range = resolveDashboardDateRange(filter);
    const topOutlets = await this.repo.getTopOutlets(filter, range, limit);
    return { range, topOutlets };
  }

  async getCharts(filter: DashboardFilter) {
    const range = resolveDashboardDateRange(filter);
    const [
      revenueTrend,
      orderStatusCounts,
      paymentStatusCounts,
      customerMetrics,
      deliveryMetrics,
    ] = await Promise.all([
      this.repo.getDailyTrend(filter, range),
      this.repo.getOrderStatusCounts(filter, range),
      this.repo.getPaymentStatusCounts(filter, range),
      this.repo.getCustomerMetrics(filter, range),
      this.repo.getDeliveryMetrics(filter, range),
    ]);

    return {
      range,
      revenueTrend,
      orderTrend: revenueTrend.map((p) => ({ date: p.date, orders: p.orders })),
      customerGrowth: [],
      paymentTrend: [],
      deliveryTrend: [],
      refundTrend: [],
      cancellationTrend: [],
      averageOrderValueTrend: revenueTrend.map((p) => ({
        date: p.date,
        value: p.orders > 0 ? Number((p.revenue / p.orders).toFixed(2)) : 0,
      })),
      orderStatusDistribution: orderStatusCounts,
      paymentStatusDistribution: paymentStatusCounts,
      customerMetrics,
      deliveryMetrics,
    };
  }
}
