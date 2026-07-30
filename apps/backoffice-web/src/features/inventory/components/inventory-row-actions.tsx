'use client';

import { useState } from 'react';
import {
  ClipboardList,
  Edit3,
  Plus,
  Send,
} from 'lucide-react';

import { IconActionButton } from '@/components/ui/icon-action-button';
import { InventoryListItem } from '../types/inventory.types';
import AddStockModal from './add-stock-modal';
import AdjustStockModal from './adjust-stock-modal';
import TransferStockModal from './transfer-stock-modal';
import InventoryTransactionsModal from './inventory-transactions-modal';

interface Props {
  item: InventoryListItem;
  disabled?: boolean;
  onActionStart?: () => void;
  onActionComplete: () => void;
}

export default function InventoryRowActions({
  item,
  disabled = false,
  onActionStart,
  onActionComplete,
}: Props) {
  const [action, setAction] = useState<
    'add' | 'adjust' | 'transfer' | 'logs' | null
  >(null);

  const isInactive = item.status === 'INACTIVE';

  const closeModal = () => setAction(null);

  const handleSuccess = () => {
    closeModal();
    onActionComplete();
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <IconActionButton
          icon={<Plus size={14} />}
          label="Add stock"
          variant="activate"
          disabled={disabled || isInactive}
          onClick={() => {
            onActionStart?.();
            setAction('add');
          }}
        />
        <IconActionButton
          icon={<Edit3 size={14} />}
          label="Adjust stock"
          variant="edit"
          disabled={disabled || isInactive}
          onClick={() => {
            onActionStart?.();
            setAction('adjust');
          }}
        />
        <IconActionButton
          icon={<Send size={14} />}
          label="Transfer stock"
          variant="deactivate"
          disabled={disabled || isInactive}
          onClick={() => {
            onActionStart?.();
            setAction('transfer');
          }}
        />
        <IconActionButton
          icon={<ClipboardList size={14} />}
          label="View transactions"
          disabled={disabled}
          onClick={() => setAction('logs')}
        />
      </div>

      {action === 'add' && (
        <AddStockModal
          item={item}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
      {action === 'adjust' && (
        <AdjustStockModal
          item={item}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
      {action === 'transfer' && (
        <TransferStockModal
          item={item}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}
      {action === 'logs' && (
        <InventoryTransactionsModal item={item} onClose={closeModal} />
      )}
    </>
  );
}
