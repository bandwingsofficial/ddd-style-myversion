'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import DiscardChangesDialog from '@/features/categories/components/discard-changes-dialog';
import { OutletsApi } from '@/features/outlets/api/outlets.api';
import { Outlet } from '@/features/outlets/types/outlet.types';
import { Select } from '@/components/ui/select';
import { getApiErrorMessage } from '@/lib/api-error';
import { OutletUsersApi } from '../api/outlet-users.api';
import {
  OutletUser,
  OutletUserFormErrors,
  OutletUserRole,
  OUTLET_USER_ROLE_OPTIONS,
} from '../types/outlet-user.types';
import {
  formInputClassName,
  validateCreateForm,
  validateEditForm,
  validateUserEmail,
  validateUserName,
  validateUserPassword,
  validateUserPhone,
} from '../utils/outlet-user-validation';

type FormMode = 'create' | 'edit';

interface FormSnapshot {
  name: string;
  email: string;
  phone: string;
  role: OutletUserRole;
  password: string;
  outletId: string;
}

interface Props {
  mode: FormMode;
  open: boolean;
  outletId: string;
  user?: OutletUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_SNAPSHOT = (outletId: string): FormSnapshot => ({
  name: '',
  email: '',
  phone: '',
  role: 'STAFF',
  password: '',
  outletId,
});

function snapshotFromUser(user: OutletUser): FormSnapshot {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    role: user.role,
    password: '',
    outletId: user.outletId,
  };
}

export default function OutletUserFormModal({
  mode,
  open,
  outletId,
  user = null,
  onClose,
  onSuccess,
}: Props) {
  const isCreate = mode === 'create';
  const [form, setForm] = useState<FormSnapshot>(EMPTY_SNAPSHOT(outletId));
  const [errors, setErrors] = useState<OutletUserFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState<FormSnapshot>(
    EMPTY_SNAPSHOT(outletId),
  );
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const resetForm = useCallback(() => {
    if (isCreate) {
      const snapshot = EMPTY_SNAPSHOT(outletId);
      setForm(snapshot);
      setInitialSnapshot(snapshot);
    } else if (user) {
      const snapshot = snapshotFromUser(user);
      setForm(snapshot);
      setInitialSnapshot(snapshot);
    }

    setErrors({});
    setSubmitting(false);
    setShowDiscardDialog(false);
  }, [isCreate, outletId, user]);

  useEffect(() => {
    if (open) {
      resetForm();
      void OutletsApi.list().then((data) => setOutlets(Array.isArray(data) ? data : []));
    }
  }, [open, resetForm]);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialSnapshot),
    [form, initialSnapshot],
  );

  const outletOptions = useMemo(
    () =>
      outlets.map((outlet) => ({
        value: outlet.id,
        label: outlet.name,
      })),
    [outlets],
  );

  const roleOptions = OUTLET_USER_ROLE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  }));

  const requestClose = () => {
    if (submitting) return;
    if (isDirty) {
      setShowDiscardDialog(true);
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    const nextErrors = isCreate
      ? validateCreateForm(form)
      : validateEditForm(form);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);

    try {
      if (isCreate) {
        await OutletUsersApi.create({
          outletId: form.outletId,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          role: form.role,
          password: form.password,
        });
        toast.success('User created successfully.');
      } else if (user) {
        await OutletUsersApi.update(user.id, {
          name: form.name.trim(),
          phone: form.phone.trim() || undefined,
          role: form.role,
          outletId: form.outletId,
        });
        toast.success('User updated successfully.');
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save user.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10050] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          onClick={requestClose}
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
                  {isCreate ? 'Create Outlet User' : 'Edit Outlet User'}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {isCreate
                    ? 'Add a new user account for this outlet.'
                    : `Updating ${user?.name ?? 'user'}`}
                </p>
              </div>
              <button
                type="button"
                onClick={requestClose}
                disabled={submitting}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 sm:px-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold text-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    onBlur={() =>
                      setErrors((current) => ({
                        ...current,
                        name: validateUserName(form.name),
                      }))
                    }
                    disabled={submitting || (!isCreate && !user?.isActive)}
                    className={formInputClassName(!!errors.name)}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    onBlur={() =>
                      setErrors((current) => ({
                        ...current,
                        email: validateUserEmail(form.email),
                      }))
                    }
                    disabled={submitting || !isCreate}
                    className={formInputClassName(!!errors.email)}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Phone
                  </label>
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    onBlur={() =>
                      setErrors((current) => ({
                        ...current,
                        phone: validateUserPhone(form.phone),
                      }))
                    }
                    disabled={submitting || (!isCreate && !user?.isActive)}
                    className={formInputClassName(!!errors.phone)}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Role <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={form.role}
                    onChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        role: value as OutletUserRole,
                      }))
                    }
                    options={roleOptions}
                    disabled={submitting || (!isCreate && !user?.isActive)}
                    hasError={!!errors.role}
                    aria-label="User role"
                  />
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Assigned Outlet <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={form.outletId}
                    onChange={(value) =>
                      setForm((current) => ({ ...current, outletId: value }))
                    }
                    options={outletOptions}
                    disabled={
                      submitting ||
                      isCreate ||
                      (!isCreate && !user?.isActive)
                    }
                    hasError={!!errors.outletId}
                    aria-label="Assigned outlet"
                  />
                  {errors.outletId && (
                    <p className="text-sm text-destructive">
                      {errors.outletId}
                    </p>
                  )}
                </div>

                {isCreate && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-foreground">
                      Password <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      onBlur={() =>
                        setErrors((current) => ({
                          ...current,
                          password: validateUserPassword(form.password),
                        }))
                      }
                      disabled={submitting}
                      className={formInputClassName(!!errors.password)}
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={requestClose}
                disabled={submitting}
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || (!isCreate && !user?.isActive)}
                onClick={() => void handleSubmit()}
                className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : isCreate ? (
                  'Create User'
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <DiscardChangesDialog
        open={showDiscardDialog}
        onContinue={() => setShowDiscardDialog(false)}
        onDiscard={() => {
          setShowDiscardDialog(false);
          onClose();
        }}
      />
    </>
  );
}
