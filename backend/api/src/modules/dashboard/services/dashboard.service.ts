import { Injectable } from '@nestjs/common';

import { DashboardFilter } from '../domain/types/dashboard-filter.types';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { DashboardStatisticsService } from './dashboard-statistics.service';
import { DashboardRepository } from '../repositories/dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly statistics: DashboardStatisticsService,
    private readonly analytics: DashboardAnalyticsService,
    private readonly repo: DashboardRepository,
  ) {}

  getSummary(filter: DashboardFilter) {
    return this.statistics.buildSummary(filter);
  }

  getRevenue(filter: DashboardFilter) {
    return this.analytics.getRevenueAnalytics(filter);
  }

  getOrders(filter: DashboardFilter) {
    return this.analytics.getOrderAnalytics(filter);
  }

  getPayments(filter: DashboardFilter) {
    return this.analytics.getPaymentAnalytics(filter);
  }

  getProducts(filter: DashboardFilter, limit: number) {
    return this.analytics.getProductAnalytics(filter, limit);
  }

  getCustomers(filter: DashboardFilter) {
    return this.analytics.getCustomerAnalytics(filter);
  }

  getOutlets(filter: DashboardFilter, limit: number) {
    return this.analytics.getOutletAnalytics(filter, limit);
  }

  getCategories(filter: DashboardFilter, limit: number) {
    return this.analytics.getCategoryAnalytics(filter, limit);
  }

  getBrands() {
    return {
      totalBrands: 0,
      items: [],
      message: 'Brand analytics unavailable — brand module not configured',
    };
  }

  getRecentOrders(filter: DashboardFilter, limit: number) {
    return this.repo.getRecentOrders(filter, limit);
  }

  getRecentPayments(filter: DashboardFilter, limit: number) {
    return this.repo.getRecentPayments(filter, limit);
  }

  getLowStock(limit: number) {
    return this.repo.getLowStockItems(limit);
  }

  getCharts(filter: DashboardFilter) {
    return this.analytics.getCharts(filter);
  }

  async exportCsv(filter: DashboardFilter, section: string) {
    if (section === 'orders') {
      const orders = await this.repo.getRecentOrders(filter, 500);
      const headers = [
        'Order Number',
        'Customer',
        'Phone',
        'Outlet',
        'Items',
        'Payment Status',
        'Order Status',
        'Amount',
        'Created At',
      ];
      const rows = orders.map((order) => [
        order.orderNumber,
        order.customerName,
        order.customerPhone,
        order.outletName,
        order.itemCount,
        order.paymentStatus,
        order.orderStatus,
        order.amount,
        order.createdAt.toISOString(),
      ]);
      return this.toCsv(headers, rows);
    }

    if (section === 'payments') {
      const payments = await this.repo.getRecentPayments(filter, 500);
      const headers = [
        'Transaction ID',
        'Gateway',
        'Amount',
        'Status',
        'Attempt',
        'Customer',
        'Order Number',
        'Paid At',
      ];
      const rows = payments.map((payment) => [
        payment.transactionId ?? payment.id,
        payment.gateway,
        payment.amount,
        payment.status,
        payment.attemptNo,
        payment.customerName,
        payment.orderNumber,
        payment.paidAt?.toISOString() ?? '',
      ]);
      return this.toCsv(headers, rows);
    }

    const summary = await this.statistics.buildSummary(filter);
    const headers = ['Metric Group', 'Metric', 'Value'];
    const rows: Array<Array<string | number>> = [];

    Object.entries(summary.revenue).forEach(([key, value]) => {
      rows.push(['Revenue', key, value as number]);
    });
    Object.entries(summary.orders).forEach(([key, value]) => {
      rows.push(['Orders', key, value as number]);
    });
    Object.entries(summary.payments).forEach(([key, value]) => {
      rows.push(['Payments', key, value as number]);
    });

    return this.toCsv(headers, rows);
  }

  private toCsv(headers: string[], rows: Array<Array<string | number>>) {
    const escape = (value: string | number) => {
      const text = String(value ?? '');
      if (text.includes(',') || text.includes('"') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    return [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  }
}
