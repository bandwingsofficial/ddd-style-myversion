'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

import { dashCardInteractive, dashIconWrap } from './dashboard-ui';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: keyof typeof dashIconWrap;
  loading?: boolean;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'emerald',
  loading,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`${dashCardInteractive} p-5`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          {loading ? (
            <div className="mt-2.5 h-8 w-28 dash-shimmer rounded-xl" />
          ) : (
            <p className="mt-1.5 text-[1.75rem] font-bold leading-none tracking-tight text-slate-900">
              {value}
            </p>
          )}
          {subtitle && (
            <p className="mt-1.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${dashIconWrap[accent]}`}
        >
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}
