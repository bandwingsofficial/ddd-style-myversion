'use client';

import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

type IconActionVariant =
  | 'edit'
  | 'activate'
  | 'deactivate'
  | 'delete'
  | 'details'
  | 'reset'
  | 'default';

interface IconActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: IconActionVariant;
  className?: string;
}

const variantClasses: Record<IconActionVariant, string> = {
  edit: 'border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50',
  activate:
    'border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50',
  deactivate:
    'border-amber-200 text-amber-600 hover:border-amber-300 hover:bg-amber-50',
  delete:
    'border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700',
  reset:
    'border-violet-200 text-violet-600 hover:border-violet-300 hover:bg-violet-50',
  details:
    'border-primary/30 text-primary hover:border-primary/50 hover:bg-primary/10',
  default:
    'border-input text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground',
};

export function IconActionButton({
  icon,
  label,
  onClick,
  disabled = false,
  loading = false,
  variant = 'default',
  className,
}: IconActionButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-background shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
        disabled || loading
          ? 'cursor-not-allowed border-border text-muted-foreground opacity-50'
          : variantClasses[variant],
        className,
      )}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
    </button>
  );
}
