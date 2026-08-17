import { ValidationError } from '../../../common/errors/domain-errors';
import { istCalendarDayStart } from '../../../common/utils/ist-calendar-date.util';

/**
 * Builds Prisma `createdAt` bounds from optional YYYY-MM-DD calendar dates (IST).
 * Upper bound is exclusive start of the day after `toDate`.
 */
export function buildCreatedAtFilter(
  fromDate?: string,
  toDate?: string,
): { gte?: Date; lt?: Date } | undefined {
  const from = fromDate?.trim() || undefined;
  const to = toDate?.trim() || undefined;

  if (!from && !to) {
    return undefined;
  }

  const createdAt: { gte?: Date; lt?: Date } = {};

  if (from) {
    createdAt.gte = istCalendarDayStart(from);
  }

  if (to) {
    const toStart = istCalendarDayStart(to);
    createdAt.lt = new Date(toStart.getTime() + 24 * 60 * 60 * 1000);
  }

  if (
    createdAt.gte &&
    createdAt.lt &&
    createdAt.gte.getTime() >= createdAt.lt.getTime()
  ) {
    throw new ValidationError(
      'INVALID_DATE_RANGE',
      'fromDate must be on or before toDate.',
    );
  }

  return createdAt;
}
