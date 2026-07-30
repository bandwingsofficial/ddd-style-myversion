'use client';

interface DiscardChangesDialogProps {
  open: boolean;
  onContinue: () => void;
  onDiscard: () => void;
}

export default function DiscardChangesDialog({
  open,
  onContinue,
  onDiscard,
}: DiscardChangesDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="discard-changes-title"
      aria-describedby="discard-changes-description"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <h3
          id="discard-changes-title"
          className="text-lg font-bold text-foreground"
        >
          Discard changes?
        </h3>
        <p
          id="discard-changes-description"
          className="mt-2 text-sm leading-6 text-muted-foreground"
        >
          You have unsaved changes. Are you sure you want to discard them?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onContinue}
            className="h-10 rounded-xl border border-input px-4 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Continue Editing
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="h-10 rounded-xl bg-destructive px-4 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
