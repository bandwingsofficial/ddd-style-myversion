"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100001] lg:hidden">
      <button
        type="button"
        aria-label="Close sheet"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl animate-fade-in-up"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="touch-target flex items-center justify-center rounded-full bg-slate-100 text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(85vh-4rem)] overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
