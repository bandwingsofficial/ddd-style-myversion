'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent: 'emerald' | 'blue' | 'violet' | 'amber';
  loading?: boolean;
}

const ACCENT_CLASS: Record<KpiCardProps['accent'], string> = {
  emerald: 'bg-emerald-50 text-emerald-500',
  blue: 'bg-blue-50 text-blue-500',
  violet: 'bg-violet-50 text-violet-500',
  amber: 'bg-amber-50 text-amber-500',
};

export function DashboardKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
  loading,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-w-0 flex-col gap-2 rounded-[20px] border border-slate-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:p-4"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ACCENT_CLASS[accent]}`}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0 w-full">
        <p className="truncate text-[10px] font-bold uppercase tracking-tight text-slate-500 md:text-[11px]">
          {title}
        </p>
        {loading ? (
          <div className="mt-2 h-7 w-24 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <h4 className="truncate text-xl font-black leading-tight text-slate-900 md:text-2xl">
            {value}
          </h4>
        )}
        {subtitle ? (
          <p className="mt-0.5 truncate text-xs text-slate-400">{subtitle}</p>
        ) : null}
      </div>
    </motion.div>
  );
}
