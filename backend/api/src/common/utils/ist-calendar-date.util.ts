import { ValidationError } from '../errors/domain-errors';

export const IST_TIME_ZONE = 'Asia/Kolkata';
/** India does not observe DST. IST is UTC+05:30 year-round. */
export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
export const CALENDAR_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type IstCalendarDateParts = {
  year: number;
  month: number;
  day: number;
};

export function parseIstCalendarDateParts(
  dateStr: string,
): IstCalendarDateParts {
  const trimmed = dateStr.trim();

  if (!CALENDAR_DATE_RE.test(trimmed)) {
    throw new ValidationError(
      'INVALID_DATE',
      `Invalid date "${dateStr}". Expected YYYY-MM-DD.`,
    );
  }

  const [year, month, day] = trimmed.split('-').map(Number);
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

  return { year, month, day };
}

export function istDayStart(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - IST_OFFSET_MS);
}

export function istDayEnd(year: number, month: number, day: number): Date {
  const start = istDayStart(year, month, day);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

/** Start of an IST calendar day for a validated YYYY-MM-DD string. */
export function istCalendarDayStart(dateStr: string): Date {
  const parts = parseIstCalendarDateParts(dateStr);
  return istDayStart(parts.year, parts.month, parts.day);
}

export function getIstParts(date: Date): IstCalendarDateParts {
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError('INVALID_DATE', 'Invalid date value.');
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const [year, month, day] = formatter.format(date).split('-').map(Number);
  return { year, month, day };
}
