'use client';

import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog';
import { DeleteAnalysis } from '@/lib/delete-analysis';
import { formatBlockerList } from '@/lib/delete-analysis';

interface ForceDeleteDialogProps {
  open: boolean;
  title: string;
  itemLabel: string;
  analysis: DeleteAnalysis | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function ForceDeleteDialog({
  open,
  title,
  itemLabel,
  analysis,
  loading = false,
  onCancel,
  onConfirm,
}: ForceDeleteDialogProps) {
  const dependencySummary = analysis?.removableDependencies
    .map((item) => `${item.count} ${item.label.toLowerCase()}`)
    .join(', ');

  const description = analysis
    ? `This item is currently referenced by ${dependencySummary}.`
    : 'This item has related records that can be removed automatically.';

  return (
    <ConfirmDeleteDialog
      open={open}
      title={title}
      description={description}
      itemLabel={itemLabel}
      loading={loading}
      confirmLabel="Force Delete"
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {analysis?.forceDeleteActions && analysis.forceDeleteActions.length > 0 ? (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Deleting will automatically:
          </p>
          <ul className="space-y-1.5 rounded-xl bg-muted/40 px-4 py-3 text-sm text-foreground">
            {analysis.forceDeleteActions.map((action) => (
              <li key={action} className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-600">✓</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs font-medium text-destructive">
            This action cannot be undone.
          </p>
        </div>
      ) : null}
    </ConfirmDeleteDialog>
  );
}

interface BlockedDeleteDialogProps {
  open: boolean;
  title: string;
  message: string;
  analysis: DeleteAnalysis | null;
  onClose: () => void;
}

export function BlockedDeleteDialog({
  open,
  title,
  message,
  analysis,
  onClose,
}: BlockedDeleteDialogProps) {
  return (
    <ConfirmDeleteDialog
      open={open}
      title={title}
      description={message}
      itemLabel=""
      singleAction
      onCancel={onClose}
      onConfirm={onClose}
    >
      {analysis?.permanentBlockers.length ? (
        <div className="mt-4 rounded-xl bg-destructive/5 px-4 py-3">
          <p className="mb-2 text-sm font-semibold text-destructive">
            Permanent records found:
          </p>
          <pre className="whitespace-pre-wrap text-sm text-destructive">
            {formatBlockerList(analysis.permanentBlockers)}
          </pre>
        </div>
      ) : null}
    </ConfirmDeleteDialog>
  );
}
