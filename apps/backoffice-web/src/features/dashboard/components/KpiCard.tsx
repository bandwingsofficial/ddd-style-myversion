'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: 'emerald' | 'blue' | 'amber' | 'rose' | 'violet' | 'slate';
  loading?: boolean;
}

const accents = {
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  violet: 'bg-violet-50 text-violet-600',
  slate: 'bg-slate-100 text-slate-600',
};

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          {loading ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded-lg bg-muted" />
          ) : (
            <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
              {value}
            </p>
          )}
          {subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-xl p-3 ${accents[accent]}`}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
}
