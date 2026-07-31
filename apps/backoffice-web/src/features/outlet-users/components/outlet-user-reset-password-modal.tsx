'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api-error';
import { OutletUsersApi } from '../api/outlet-users.api';
import { OutletUser } from '../types/outlet-user.types';
import {
  formInputClassName,
  validateUserPassword,
} from '../utils/outlet-user-validation';

interface Props {
  user: OutletUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OutletUserResetPasswordModal({
  user,
  onClose,
  onSuccess,
}: Props) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (user) {
      setPassword('');
      setError(undefined);
      setShowPassword(false);
      setSubmitting(false);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async () => {
    const passwordError = validateUserPassword(password);
    setError(passwordError);
    if (passwordError) return;

    setSubmitting(true);

    try {
      await OutletUsersApi.resetPassword(user.email, password);
      toast.success('Password updated successfully.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to reset password.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10050] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
        onClick={submitting ? undefined : onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          role="dialog"
          aria-modal="true"
          className="flex max-h-[90vh] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between border-b border-border px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Reset Password
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Set a new password for {user.name}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
            <p className="text-sm text-muted-foreground">
              Account:{' '}
              <span className="font-semibold text-foreground">{user.email}</span>
            </p>
            <div className="relative space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
                New Password <span className="text-destructive">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() => setError(validateUserPassword(password))}
                disabled={submitting}
                className={`${formInputClassName(!!error)} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmit()}
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
