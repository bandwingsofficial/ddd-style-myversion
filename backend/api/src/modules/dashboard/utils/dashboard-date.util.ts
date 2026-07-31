import { DashboardPeriod } from '../domain/enums/dashboard-period.enum';
import {
  DashboardDateRange,
  DashboardFilter,
} from '../domain/types/dashboard-filter.types';

const IST_TIME_ZONE = 'Asia/Kolkata';

function getISTParts(date: Date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const [year, month, day] = formatter.format(date).split('-').map(Number);
  return { year, month, day };
}

function istDayStart(year: number, month: number, day: number): Date {
  const utc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const offsetMs = getIstOffsetMs(utc);
  return new Date(utc.getTime() - offsetMs);
}

function istDayEnd(year: number, month: number, day: number): Date {
  const start = istDayStart(year, month, day);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

function getIstOffsetMs(date: Date): number {
  const utcString = date.toLocaleString('en-US', { timeZone: 'UTC' });
  const istString = date.toLocaleString('en-US', { timeZone: IST_TIME_ZONE });
  return new Date(istString).getTime() - new Date(utcString).getTime();
}

function addDays(parts: { year: number; month: number; day: number }, days: number) {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function monthBounds(year: number, month: number) {
  const start = istDayStart(year, month, 1);
  const nextMonth = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const end = new Date(istDayStart(nextMonth.year, nextMonth.month, 1).getTime() - 1);
  return { start, end };
}

export function resolveDashboardDateRange(
  filter: DashboardFilter,
): DashboardDateRange {
  const now = new Date();
  const today = getISTParts(now);
  const period = filter.period ?? DashboardPeriod.LAST_7_DAYS;

  if (period === DashboardPeriod.CUSTOM && filter.startDate && filter.endDate) {
    const startParts = getISTParts(filter.startDate);
    const endParts = getISTParts(filter.endDate);
    const start = istDayStart(startParts.year, startParts.month, startParts.day);
    const end = istDayEnd(endParts.year, endParts.month, endParts.day);
    const duration = end.getTime() - start.getTime();

    return {
      start,
      end,
      previousStart: new Date(start.getTime() - duration - 1),
      previousEnd: new Date(start.getTime() - 1),
      label: 'Custom Range',
    };
  }

  switch (period) {
    case DashboardPeriod.TODAY: {
      const start = istDayStart(today.year, today.month, today.day);
      const end = istDayEnd(today.year, today.month, today.day);
      const yesterday = addDays(today, -1);
      return {
        start,
        end,
        previousStart: istDayStart(yesterday.year, yesterday.month, yesterday.day),
        previousEnd: istDayEnd(yesterday.year, yesterday.month, yesterday.day),
        label: 'Today',
      };
    }
    case DashboardPeriod.YESTERDAY: {
      const yesterday = addDays(today, -1);
      const start = istDayStart(yesterday.year, yesterday.month, yesterday.day);
      const end = istDayEnd(yesterday.year, yesterday.month, yesterday.day);
      const dayBefore = addDays(yesterday, -1);
      return {
        start,
        end,
        previousStart: istDayStart(dayBefore.year, dayBefore.month, dayBefore.day),
        previousEnd: istDayEnd(dayBefore.year, dayBefore.month, dayBefore.day),
        label: 'Yesterday',
      };
    }
    case DashboardPeriod.LAST_7_DAYS: {
      const startDay = addDays(today, -6);
      const start = istDayStart(startDay.year, startDay.month, startDay.day);
      const end = istDayEnd(today.year, today.month, today.day);
      const prevEndDay = addDays(startDay, -1);
      const prevStartDay = addDays(prevEndDay, -6);
      return {
        start,
        end,
        previousStart: istDayStart(prevStartDay.year, prevStartDay.month, prevStartDay.day),
        previousEnd: istDayEnd(prevEndDay.year, prevEndDay.month, prevEndDay.day),
        label: 'Last 7 Days',
      };
    }
    case DashboardPeriod.LAST_30_DAYS: {
      const startDay = addDays(today, -29);
      const start = istDayStart(startDay.year, startDay.month, startDay.day);
      const end = istDayEnd(today.year, today.month, today.day);
      const prevEndDay = addDays(startDay, -1);
      const prevStartDay = addDays(prevEndDay, -29);
      return {
        start,
        end,
        previousStart: istDayStart(prevStartDay.year, prevStartDay.month, prevStartDay.day),
        previousEnd: istDayEnd(prevEndDay.year, prevEndDay.month, prevEndDay.day),
        label: 'Last 30 Days',
      };
    }
    case DashboardPeriod.THIS_MONTH: {
      const { start, end } = monthBounds(today.year, today.month);
      const prevMonth = today.month === 1 ? 12 : today.month - 1;
      const prevYear = today.month === 1 ? today.year - 1 : today.year;
      const previous = monthBounds(prevYear, prevMonth);
      return {
        start,
        end,
        previousStart: previous.start,
        previousEnd: previous.end,
        label: 'This Month',
      };
    }
    case DashboardPeriod.LAST_MONTH: {
      const prevMonth = today.month === 1 ? 12 : today.month - 1;
      const prevYear = today.month === 1 ? today.year - 1 : today.year;
      const { start, end } = monthBounds(prevYear, prevMonth);
      const twoMonthsAgo = prevMonth === 1 ? 12 : prevMonth - 1;
      const twoMonthsYear = prevMonth === 1 ? prevYear - 1 : prevYear;
      const previous = monthBounds(twoMonthsYear, twoMonthsAgo);
      return {
        start,
        end,
        previousStart: previous.start,
        previousEnd: previous.end,
        label: 'Last Month',
      };
    }
    case DashboardPeriod.LAST_3_MONTHS: {
      const startDay = addDays(today, -89);
      const start = istDayStart(startDay.year, startDay.month, startDay.day);
      const end = istDayEnd(today.year, today.month, today.day);
      return { start, end, label: 'Last 3 Months' };
    }
    case DashboardPeriod.LAST_6_MONTHS: {
      const startDay = addDays(today, -179);
      const start = istDayStart(startDay.year, startDay.month, startDay.day);
      const end = istDayEnd(today.year, today.month, today.day);
      return { start, end, label: 'Last 6 Months' };
    }
    case DashboardPeriod.THIS_YEAR: {
      const start = istDayStart(today.year, 1, 1);
      const end = istDayEnd(today.year, today.month, today.day);
      return {
        start,
        end,
        previousStart: istDayStart(today.year - 1, 1, 1),
        previousEnd: istDayEnd(today.year - 1, 12, 31),
        label: 'This Year',
      };
    }
    case DashboardPeriod.LAST_YEAR: {
      const start = istDayStart(today.year - 1, 1, 1);
      const end = istDayEnd(today.year - 1, 12, 31);
      return {
        start,
        end,
        previousStart: istDayStart(today.year - 2, 1, 1),
        previousEnd: istDayEnd(today.year - 2, 12, 31),
        label: 'Last Year',
      };
    }
    default: {
      const startDay = addDays(today, -6);
      const start = istDayStart(startDay.year, startDay.month, startDay.day);
      const end = istDayEnd(today.year, today.month, today.day);
      return { start, end, label: 'Last 7 Days' };
    }
  }
}

export function getTodayRange(): DashboardDateRange {
  return resolveDashboardDateRange({ period: DashboardPeriod.TODAY });
}

export function getYesterdayRange(): DashboardDateRange {
  return resolveDashboardDateRange({ period: DashboardPeriod.YESTERDAY });
}
