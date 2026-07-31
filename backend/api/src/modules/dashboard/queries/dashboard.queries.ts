import { Injectable } from '@nestjs/common';

import { DashboardFilterQueryDto } from '../dtos/dashboard-filter-query.dto';
import { DashboardPeriod } from '../domain/enums/dashboard-period.enum';
import { DashboardFilter } from '../domain/types/dashboard-filter.types';

@Injectable()
export class DashboardQueries {
  toFilter(query: DashboardFilterQueryDto): DashboardFilter {
    return {
      period: query.period ?? DashboardPeriod.LAST_7_DAYS,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      outletId: query.outletId,
      categoryId: query.categoryId,
      productId: query.productId,
      paymentStatus: query.paymentStatus,
      orderStatus: query.orderStatus,
    };
  }

  resolveTopLimit(query: DashboardFilterQueryDto, fallback = 10): number {
    const parsed = Number(query.topLimit);
    if (!parsed || parsed <= 0) return fallback;
    return Math.min(parsed, 50);
  }
}
