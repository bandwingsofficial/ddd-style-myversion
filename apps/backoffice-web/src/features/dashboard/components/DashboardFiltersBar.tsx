'use client';

import { DashboardFilters, DashboardPeriod } from '../types/dashboard.types';
import {
  dashFilterChip,
  dashFilterChipActive,
  dashInput,
} from './dashboard-ui';

const PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: 'TODAY', label: 'Today' },
  { value: 'YESTERDAY', label: 'Yesterday' },
  { value: 'LAST_7_DAYS', label: '7 Days' },
  { value: 'LAST_30_DAYS', label: '30 Days' },
  { value: 'THIS_MONTH', label: 'This Month' },
  { value: 'LAST_MONTH', label: 'Last Month' },
  { value: 'THIS_YEAR', label: 'This Year' },
  { value: 'CUSTOM', label: 'Custom Range' },
];

interface Props {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
}

export function DashboardFiltersBar({
  filters,
  onChange,
}: Props) {
  const activePeriod = filters.period ?? 'LAST_7_DAYS';

  return (
    <div className="w-full">
      <div className="flex w-full items-center gap-2">
        {PERIOD_OPTIONS.map((option) => {
          const active = activePeriod === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onChange({
                  ...filters,
                  period: option.value,
                })
              }
              className={`
                ${dashFilterChip}
                ${active ? dashFilterChipActive : ''}
                flex-1
                min-w-0
              `}
            >
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}

        {activePeriod === 'CUSTOM' && (
          <>
            <input
              type="date"
              value={filters.startDate?.slice(0, 10) ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  startDate: e.target.value,
                })
              }
              className={dashInput}
            />

            <span className="text-sm text-slate-400">to</span>

            <input
              type="date"
              value={filters.endDate?.slice(0, 10) ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  endDate: e.target.value,
                })
              }
              className={dashInput}
            />
          </>
        )}
      </div>
    </div>
  );
}