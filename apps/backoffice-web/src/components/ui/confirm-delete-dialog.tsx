'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  itemLabel: string;
  loading?: boolean;
  confirmLabel?: string;
  singleAction?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
}

export default function ConfirmDeleteDialog({
  open,
  title,
  description,
  itemLabel,
  loading = false,
  confirmLabel = 'Delete Permanently',
  singleAction = false,
  onCancel,
  onConfirm,
  children,
}: ConfirmDeleteDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/60 p-4"
      onClick={loading ? undefined : onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2
          id="confirm-delete-title"
          className="text-lg font-bold text-foreground"
        >
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <p className="mt-4 rounded-xl bg-muted/40 px-4 py-3 text-sm font-semibold text-foreground">
          {itemLabel}
        </p>
        {children}

        <div className="mt-6 flex justify-end gap-3">
          {!singleAction && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-input px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void onConfirm();
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
              singleAction
                ? 'border border-input bg-background text-foreground hover:bg-muted'
                : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
            }`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {singleAction ? 'Close' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
