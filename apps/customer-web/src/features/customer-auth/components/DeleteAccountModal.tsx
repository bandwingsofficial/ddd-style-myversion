"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { accountDeletionApi } from "@/features/customer-auth/api/account-deletion.api";
import {
  beginSessionTermination,
  cancelSessionTermination,
  syncAfterLogout,
} from "@/features/customer-auth/services/auth-sync.service";
import { useRouter } from "next/navigation";

const CONFIRMATION_TEXT = "DELETE";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
}: DeleteAccountModalProps) {
  const router = useRouter();
  const confirmRef = useRef<HTMLInputElement>(null);

  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmation === CONFIRMATION_TEXT;

  useEffect(() => {
    if (!isOpen) {
      setConfirmation("");
      setSubmitting(false);
      setError(null);
      return;
    }

    setTimeout(() => confirmRef.current?.focus(), 50);
  }, [isOpen]);

  if (!isOpen) return null;

  const extractError = (err: unknown) => {
    const ax = err as {
      response?: { data?: { message?: string; code?: string } };
      message?: string;
    };
    return (
      ax?.response?.data?.message ||
      ax?.message ||
      "Something went wrong. Please try again."
    );
  };

  const handleDelete = async () => {
    if (!canDelete || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      // Block refresh for in-flight protected requests during deletion.
      beginSessionTermination();

      await accountDeletionApi.deleteAccount();

      syncAfterLogout();
      toast.success("Your account has been permanently deleted");
      onClose();
      router.replace("/login");
    } catch (err) {
      cancelSessionTermination();

      const message = extractError(err);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/55 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-[1.75rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 text-red-600">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">
                Delete Account
              </h3>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Permanent action
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <div className="text-sm space-y-2">
              <p className="font-bold">This cannot be undone.</p>
              <ul className="list-disc pl-4 space-y-1 text-amber-800/90">
                <li>Your Canten account and profile will be deleted.</li>
                <li>
                  Saved addresses and personal information will be removed.
                </li>
                <li>Active sessions will be signed out immediately.</li>
                <li>
                  Historical orders and payment records may be retained for
                  business, accounting, support, and legal requirements.
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              Type{" "}
              <span className="font-mono text-red-600">{CONFIRMATION_TEXT}</span>{" "}
              to confirm
            </label>
            <input
              ref={confirmRef}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={confirmation}
              disabled={submitting}
              onChange={(e) => {
                setConfirmation(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canDelete && !submitting) {
                  void handleDelete();
                }
              }}
              className="w-full h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 font-mono font-bold tracking-widest text-slate-800 focus:outline-none focus:border-red-400"
              placeholder={CONFIRMATION_TEXT}
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canDelete || submitting}
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
