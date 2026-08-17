import { ForbiddenException, Injectable } from '@nestjs/common';

import { ActorType } from '../../auth/domain/enums/actor-type.enum';
import { istCalendarDayStart } from '../../../common/utils/ist-calendar-date.util';
import { DashboardFilterQueryDto } from '../dtos/dashboard-filter-query.dto';
import { DashboardPeriod } from '../domain/enums/dashboard-period.enum';
import { DashboardFilter } from '../domain/types/dashboard-filter.types';

export type DashboardActor = {
  actorType: ActorType;
  outletId?: string;
};

@Injectable()
export class DashboardQueries {
  toFilter(query: DashboardFilterQueryDto): DashboardFilter {
    return {
      period: query.period ?? DashboardPeriod.LAST_7_DAYS,
      startDate: query.startDate
        ? istCalendarDayStart(query.startDate)
        : undefined,
      endDate: query.endDate ? istCalendarDayStart(query.endDate) : undefined,
      outletId: query.outletId,
      categoryId: query.categoryId,
      productId: query.productId,
      paymentStatus: query.paymentStatus,
      orderStatus: query.orderStatus,
    };
  }

  applyActorScope(
    filter: DashboardFilter,
    user: DashboardActor,
  ): DashboardFilter {
    if (user.actorType !== ActorType.OUTLET_USER) {
      return filter;
    }

    if (!user.outletId) {
      throw new ForbiddenException('Outlet not found');
    }

    return {
      ...filter,
      outletId: user.outletId,
    };
  }

  resolveTopLimit(query: DashboardFilterQueryDto, fallback = 10): number {
    const parsed = Number(query.topLimit);
    if (!parsed || parsed <= 0) return fallback;
    return Math.min(parsed, 50);
  }
}
