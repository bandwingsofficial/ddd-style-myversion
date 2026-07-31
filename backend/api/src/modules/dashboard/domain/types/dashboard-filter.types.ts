import { DashboardPeriod } from '../enums/dashboard-period.enum';

export interface DashboardFilter {
  period?: DashboardPeriod;
  startDate?: Date;
  endDate?: Date;
  outletId?: string;
  categoryId?: string;
  productId?: string;
  paymentStatus?: string;
  orderStatus?: string;
}

export interface DashboardDateRange {
  start: Date;
  end: Date;
  previousStart?: Date;
  previousEnd?: Date;
  label: string;
}
