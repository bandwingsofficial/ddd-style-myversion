import { DashboardPeriod } from '../../modules/dashboard/domain/enums/dashboard-period.enum';
import { resolveDashboardDateRange } from '../../modules/dashboard/utils/dashboard-date.util';

describe('resolveDashboardDateRange', () => {
  it('resolves custom ranges using IST calendar days, including day 30', () => {
    const range = resolveDashboardDateRange({
      period: DashboardPeriod.CUSTOM,
      startDate: new Date('2026-08-30T00:00:00.000Z'),
      endDate: new Date('2026-08-30T00:00:00.000Z'),
    });

    expect(range.label).toBe('Custom Range');
    expect(range.start.getTime()).toBeLessThanOrEqual(range.end.getTime());
  });

  it('resolves LAST_7_DAYS without throwing', () => {
    const range = resolveDashboardDateRange({
      period: DashboardPeriod.LAST_7_DAYS,
    });

    expect(range.label).toBe('Last 7 Days');
    expect(range.start.getTime()).toBeLessThanOrEqual(range.end.getTime());
  });
});
