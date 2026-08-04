"use client";

import { Loader2 } from "lucide-react";
import { createPortal } from "react-dom";

interface CancelUnpaidOrderModalProps {
  isOpen: boolean;
  processing?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function CancelUnpaidOrderModal({
  isOpen,
  processing = false,
  onConfirm,
  onClose,
}: CancelUnpaidOrderModalProps) {
  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-unpaid-order-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="cancel-unpaid-order-title"
          className="text-lg font-semibold text-slate-900"
        >
          Cancel unpaid order?
        </h2>
        <p className="mt-2 text-base leading-relaxed text-slate-600">
          Are you sure you want to cancel this unpaid order?
        </p>
        <p className="mt-1 text-sm text-slate-500">
          You can always place another order later.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="inline-flex h-[42px] items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-5 text-base font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Keep order
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={processing}
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] bg-[#DC2626] px-5 text-base font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Cancel order
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
