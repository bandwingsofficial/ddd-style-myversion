import { ValidationError } from '../errors/domain-errors';
import {
  getIstParts,
  istCalendarDayStart,
  istDayEnd,
  parseIstCalendarDateParts,
} from './ist-calendar-date.util';

describe('ist-calendar-date.util', () => {
  it('parses day 30 without locale-dependent Date parsing', () => {
    const parts = parseIstCalendarDateParts('2026-08-30');
    expect(parts).toEqual({ year: 2026, month: 8, day: 30 });
  });

  it('builds inclusive IST day bounds for day 30', () => {
    const start = istCalendarDayStart('2026-08-30');
    const end = istDayEnd(2026, 8, 30);

    expect(start.getTime()).toBeLessThan(end.getTime());
    expect(getIstParts(start)).toEqual({ year: 2026, month: 8, day: 30 });
    expect(getIstParts(end)).toEqual({ year: 2026, month: 8, day: 30 });
  });

  it('rejects invalid calendar dates', () => {
    expect(() => parseIstCalendarDateParts('2026-02-30')).toThrow(
      ValidationError,
    );
  });
});
