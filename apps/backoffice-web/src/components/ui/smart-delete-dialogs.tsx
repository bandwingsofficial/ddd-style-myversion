'use client';

import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog';
import ForceDeleteDialog, {
  BlockedDeleteDialog,
} from '@/components/ui/force-delete-dialog';
import { DeleteAnalysis } from '@/lib/delete-analysis';

interface SmartDeleteDialogsProps {
  entityName: string;
  itemLabel: string;
  showInitial: boolean;
  initialDescription?: string;
  forceAnalysis: DeleteAnalysis | null;
  blockedAnalysis: DeleteAnalysis | null;
  blockedMessage: string | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  onConfirmForce: () => void | Promise<void>;
  onCloseBlocked: () => void;
  onCloseForce: () => void;
}

export default function SmartDeleteDialogs({
  entityName,
  itemLabel,
  showInitial,
  initialDescription = 'This action is permanent and cannot be undone.',
  forceAnalysis,
  blockedAnalysis,
  blockedMessage,
  loading,
  onCancel,
  onConfirm,
  onConfirmForce,
  onCloseBlocked,
  onCloseForce,
}: SmartDeleteDialogsProps) {
  return (
    <>
      <ConfirmDeleteDialog
        open={showInitial}
        title={`Delete ${entityName}?`}
        description={initialDescription}
        itemLabel={itemLabel}
        loading={loading}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />

      <ForceDeleteDialog
        open={!!forceAnalysis}
        title={`Delete ${entityName}?`}
        itemLabel={itemLabel}
        analysis={forceAnalysis}
        loading={loading}
        onCancel={onCloseForce}
        onConfirm={onConfirmForce}
      />

      <BlockedDeleteDialog
        open={!!blockedAnalysis}
        title={`Cannot Delete ${entityName}`}
        message={
          blockedMessage ?? `This ${entityName.toLowerCase()} cannot be deleted.`
        }
        analysis={blockedAnalysis}
        onClose={onCloseBlocked}
      />
    </>
  );
}
