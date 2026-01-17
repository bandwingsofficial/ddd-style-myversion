"use client";

import { useState } from "react";
import { InventoryItem } from "../types/inventory.types";
import AddStockModal from "./add-stock-modal";
import AdjustStockModal from "./adjust-stock-modal";
import TransferStockModal from "./transfer-stock-modal";
import InventoryTransactionsModal from "./inventory-transactions-modal";
import { Plus, Edit3, Send, ClipboardList } from "lucide-react";

interface Props {
  item: InventoryItem;
  onActionComplete: () => void;
}

export default function InventoryRowActions({ item, onActionComplete }: Props) {
  const [action, setAction] = useState<"add" | "adjust" | "transfer" | "logs" | null>(null);

  // Check if the item is inactive to restrict actions
  const isDisabled = item.status === "INACTIVE";

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        {/* ADD STOCK - Restricted */}
        <button 
          onClick={() => !isDisabled && setAction("add")} 
          disabled={isDisabled}
          style={{
            ...styles.actionBtn,
            ...(isDisabled ? styles.disabledBtn : {})
          }} 
          title={isDisabled ? "Cannot add stock to inactive item" : "Add Stock"}
        >
          <Plus size={16} /> Add
        </button>

        {/* ADJUST - Restricted */}
        <button 
          onClick={() => !isDisabled && setAction("adjust")} 
          disabled={isDisabled}
          style={{
            ...styles.actionBtn, 
            color: isDisabled ? '#94a3b8' : '#3b82f6',
            ...(isDisabled ? styles.disabledBtn : {})
          }} 
          title={isDisabled ? "Cannot adjust inactive item" : "Adjust"}
        >
          <Edit3 size={16} />
        </button>

        {/* TRANSFER - Restricted */}
        <button 
          onClick={() => !isDisabled && setAction("transfer")} 
          disabled={isDisabled}
          style={{
            ...styles.actionBtn, 
            color: isDisabled ? '#94a3b8' : '#f59e0b',
            ...(isDisabled ? styles.disabledBtn : {})
          }} 
          title={isDisabled ? "Cannot transfer inactive item" : "Transfer"}
        >
          <Send size={16} />
        </button>

        {/* LOGS - Always Active */}
        <button 
          onClick={() => setAction("logs")} 
          style={{...styles.actionBtn, color: '#64748b'}} 
          title="Transaction History"
        >
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <ClipboardList size={16} />
          </span>
        </button>
      </div>

      {action === "add" && <AddStockModal item={item} onClose={() => setAction(null)} onSuccess={onActionComplete} />}
      {action === "adjust" && <AdjustStockModal item={item} onClose={() => setAction(null)} onSuccess={onActionComplete} />}
      {action === "transfer" && <TransferStockModal item={item} onClose={() => setAction(null)} onSuccess={onActionComplete} />}
      {action === "logs" && <InventoryTransactionsModal item={item} onClose={() => setAction(null)} />}
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  actionBtn: { 
    display: 'flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1px solid #e2e8f0', 
    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#10b981', 
    cursor: 'pointer', transition: 'all 0.2s'
  },
  disabledBtn: {
    backgroundColor: '#f8fafc',
    borderColor: '#f1f5f9',
    color: '#94a3b8',
    cursor: 'not-allowed',
    opacity: 0.6
  }
};