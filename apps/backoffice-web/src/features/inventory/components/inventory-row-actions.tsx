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

  // Common button class for DRY code
  const baseBtnClass = "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:border-transparent disabled:opacity-70";

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        
        {/* ADD STOCK - Primary Action */}
        <button 
          onClick={() => !isDisabled && setAction("add")} 
          disabled={isDisabled}
          className={`${baseBtnClass} border-input bg-background text-primary hover:border-primary hover:bg-primary/5 focus:ring-primary/20`}
          title={isDisabled ? "Cannot add stock to inactive item" : "Add Stock"}
        >
          <Plus size={14} /> 
          <span className="hidden sm:inline">Add</span>
        </button>

        {/* ADJUST - Blue Action */}
        <button 
          onClick={() => !isDisabled && setAction("adjust")} 
          disabled={isDisabled}
          className={`${baseBtnClass} border-input bg-background text-blue-600 hover:border-blue-500 hover:bg-blue-50 focus:ring-blue-500/20`}
          title={isDisabled ? "Cannot adjust inactive item" : "Adjust"}
        >
          <Edit3 size={14} />
          <span className="hidden sm:inline">Adjust</span>
        </button>

        {/* TRANSFER - Amber Action */}
        <button 
          onClick={() => !isDisabled && setAction("transfer")} 
          disabled={isDisabled}
          className={`${baseBtnClass} border-input bg-background text-amber-600 hover:border-amber-500 hover:bg-amber-50 focus:ring-amber-500/20`}
          title={isDisabled ? "Cannot transfer inactive item" : "Transfer"}
        >
          <Send size={14} />
          <span className="hidden sm:inline">Transfer</span>
        </button>

        {/* LOGS - Neutral Action (Always Active) */}
        <button 
          onClick={() => setAction("logs")} 
          className={`${baseBtnClass} border-transparent text-muted-foreground hover:bg-muted hover:text-foreground`}
          title="Transaction History"
        >
          <ClipboardList size={16} />
          {/* Logs usually just needs an icon to save space, but you can uncomment below if you want text */}
          {/* <span className="hidden sm:inline">Logs</span> */}
        </button>
      </div>

      {/* MODALS */}
      {action === "add" && (
        <AddStockModal item={item} onClose={() => setAction(null)} onSuccess={onActionComplete} />
      )}
      {action === "adjust" && (
        <AdjustStockModal item={item} onClose={() => setAction(null)} onSuccess={onActionComplete} />
      )}
      {action === "transfer" && (
        <TransferStockModal item={item} onClose={() => setAction(null)} onSuccess={onActionComplete} />
      )}
      {action === "logs" && (
        <InventoryTransactionsModal item={item} onClose={() => setAction(null)} />
      )}
    </>
  );
}