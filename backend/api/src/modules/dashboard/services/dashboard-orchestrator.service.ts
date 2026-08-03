import { Injectable } from '@nestjs/common';

import { AuditLogRepository } from '../../auth/repositories/audit-log.repository';
import { ActorType } from '../../auth/domain/enums/actor-type.enum';
import { AuditAction } from '../../auth/domain/enums/audit-action.enum';
import { DashboardFilter } from '../domain/types/dashboard-filter.types';
import { DashboardCacheService } from './dashboard-cache.service';
import { DashboardService } from './dashboard.service';

@Injectable()
export class DashboardOrchestratorService {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly cache: DashboardCacheService,
    private readonly auditLogRepo: AuditLogRepository,
  ) {}

  private async withCache<T>(
    prefix: string,
    filter: DashboardFilter,
    loader: () => Promise<T>,
    suffix = '',
  ): Promise<T> {
    const cached = await this.cache.get<T>(prefix, filter, suffix);
    if (cached) return cached;

    const fresh = await loader();
    await this.cache.set(prefix, filter, fresh, 60, suffix);
    return fresh;
  }

  private async auditAccess(
    actorId: string,
    sessionId: string | undefined,
    endpoint: string,
    filter: DashboardFilter,
  ) {
    await this.auditLogRepo.create({
      actorType: ActorType.SUPER_ADMIN,
      actorId,
      sessionId,
      action: AuditAction.SUPER_ADMIN_ACTION,
      metadata: {
        endpoint,
        dashboardAccess: true,
        filter,
      },
    });
  }

  async getSummary(
    filter: DashboardFilter,
    actorId: string,
    sessionId?: string,
  ) {
    await this.auditAccess(actorId, sessionId, 'summary', filter);
    return this.withCache('summary', filter, () =>
      this.dashboardService.getSummary(filter),
    );
  }

  getRevenue(filter: DashboardFilter) {
    return this.withCache('revenue', filter, () =>
      this.dashboardService.getRevenue(filter),
    );
  }

  getOrders(filter: DashboardFilter) {
    return this.withCache('orders', filter, () =>
      this.dashboardService.getOrders(filter),
    );
  }

  getPayments(filter: DashboardFilter) {
    return this.withCache('payments', filter, () =>
      this.dashboardService.getPayments(filter),
    );
  }

  getProducts(filter: DashboardFilter, limit: number) {
    return this.withCache(
      'products',
      filter,
      () => this.dashboardService.getProducts(filter, limit),
      String(limit),
    );
  }

  getCustomers(filter: DashboardFilter) {
    return this.withCache('customers', filter, () =>
      this.dashboardService.getCustomers(filter),
    );
  }

  getOutlets(filter: DashboardFilter, limit: number) {
    return this.withCache(
      'outlets',
      filter,
      () => this.dashboardService.getOutlets(filter, limit),
      String(limit),
    );
  }

  getCategories(filter: DashboardFilter, limit: number) {
    return this.withCache(
      'categories',
      filter,
      () => this.dashboardService.getCategories(filter, limit),
      String(limit),
    );
  }

  getBrands() {
    return this.dashboardService.getBrands();
  }

  getRecentOrders(filter: DashboardFilter, limit: number) {
    return this.withCache(
      'recent-orders',
      filter,
      () => this.dashboardService.getRecentOrders(filter, limit),
      String(limit),
    );
  }

  getRecentPayments(filter: DashboardFilter, limit: number) {
    return this.withCache(
      'recent-payments',
      filter,
      () => this.dashboardService.getRecentPayments(filter, limit),
      String(limit),
    );
  }

  getLowStock(limit: number) {
    return this.withCache(
      'low-stock',
      {},
      () => this.dashboardService.getLowStock(limit),
      String(limit),
    );
  }

  getCharts(filter: DashboardFilter) {
    return this.withCache('charts', filter, () =>
      this.dashboardService.getCharts(filter),
    );
  }

  exportCsv(filter: DashboardFilter, section: string) {
    return this.dashboardService.exportCsv(filter, section);
  }
}
