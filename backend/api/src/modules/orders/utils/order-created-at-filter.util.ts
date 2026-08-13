import { ValidationError } from '../../../common/errors/domain-errors';

const CALENDAR_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const IST_TIME_ZONE = 'Asia/Kolkata';

function getIstOffsetMs(date: Date): number {
  const utcString = date.toLocaleString('en-US', { timeZone: 'UTC' });
  const istString = date.toLocaleString('en-US', { timeZone: IST_TIME_ZONE });
  return new Date(istString).getTime() - new Date(utcString).getTime();
}

/** Start of an IST calendar day for a validated YYYY-MM-DD string. */
function istCalendarDayStart(dateStr: string): Date {
  if (!CALENDAR_DATE_RE.test(dateStr)) {
    throw new ValidationError(
      'INVALID_DATE',
      `Invalid date "${dateStr}". Expected YYYY-MM-DD.`,
    );
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day));

  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    throw new ValidationError(
      'INVALID_DATE',
      `Invalid calendar date "${dateStr}".`,
    );
  }

  const utcMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return new Date(utcMidnight.getTime() - getIstOffsetMs(utcMidnight));
}

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
