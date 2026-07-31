'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Plus, Pencil, Power, PowerOff, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog';
import { useDeleteConfirm } from '@/hooks/use-delete-confirm';

import { DeliveryRulesApi } from '../api/delivery-rules.api';
import {
  DeliveryRule,
  DeliveryRuleFormValues,
} from '../types/delivery-rule.types';

const emptyForm: DeliveryRuleFormValues = {
  name: '',
  minimumOrderAmount: 0,
  deliveryFee: 30,
  isFreeDelivery: false,
  priority: 1,
  description: '',
  activate: true,
};

interface DeliveryRuleFormModalProps {
  open: boolean;
  editingRule: DeliveryRule | null;
  form: DeliveryRuleFormValues;
  saving: boolean;
  formErrors: Record<string, string>;
  onClose: () => void;
  onChange: (form: DeliveryRuleFormValues) => void;
  onSubmit: (event: React.FormEvent) => void;
}

function DeliveryRuleFormModal({
  open,
  editingRule,
  form,
  saving,
  formErrors,
  onClose,
  onChange,
  onSubmit,
}: DeliveryRuleFormModalProps) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10040] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[1px]"
          onClick={saving ? undefined : onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-rule-form-title"
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between border-b border-border px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="delivery-rule-form-title"
                  className="text-lg font-bold text-foreground"
                >
                  {editingRule ? 'Edit Delivery Rule' : 'Create Delivery Rule'}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Highest matching minimum order amount wins at checkout.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                aria-label="Close"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="rule-name" className="text-sm font-semibold text-foreground">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="rule-name"
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
                      value={form.name}
                      onChange={(e) => onChange({ ...form, name: e.target.value })}
                      required
                      disabled={saving}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-destructive">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="rule-min" className="text-sm font-semibold text-foreground">
                        Min Order (₹)
                      </label>
                      <input
                        id="rule-min"
                        type="number"
                        min={0}
                        step="0.01"
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
                        value={form.minimumOrderAmount}
                        onChange={(e) =>
                          onChange({
                            ...form,
                            minimumOrderAmount: Number(e.target.value),
                          })
                        }
                        required
                        disabled={saving}
                      />
                      {formErrors.minimumOrderAmount && (
                        <p className="text-sm text-destructive">
                          {formErrors.minimumOrderAmount}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="rule-priority" className="text-sm font-semibold text-foreground">
                        Priority
                      </label>
                      <input
                        id="rule-priority"
                        type="number"
                        min={1}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
                        value={form.priority}
                        onChange={(e) =>
                          onChange({ ...form, priority: Number(e.target.value) })
                        }
                        required
                        disabled={saving}
                      />
                      {formErrors.priority && (
                        <p className="text-sm text-destructive">{formErrors.priority}</p>
                      )}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <input
                      type="checkbox"
                      checked={form.isFreeDelivery}
                      disabled={saving}
                      onChange={(e) =>
                        onChange({
                          ...form,
                          isFreeDelivery: e.target.checked,
                          deliveryFee: e.target.checked ? 0 : form.deliveryFee || 30,
                        })
                      }
                    />
                    Free delivery rule
                  </label>

                  {!form.isFreeDelivery && (
                    <div className="space-y-1.5">
                      <label htmlFor="rule-fee" className="text-sm font-semibold text-foreground">
                        Delivery Fee (₹)
                      </label>
                      <input
                        id="rule-fee"
                        type="number"
                        min={0}
                        step="0.01"
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
                        value={form.deliveryFee}
                        onChange={(e) =>
                          onChange({ ...form, deliveryFee: Number(e.target.value) })
                        }
                        required
                        disabled={saving}
                      />
                      {formErrors.deliveryFee && (
                        <p className="text-sm text-destructive">{formErrors.deliveryFee}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="rule-desc" className="text-sm font-semibold text-foreground">
                      Description
                    </label>
                    <textarea
                      id="rule-desc"
                      rows={2}
                      className="min-h-[72px] w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm"
                      value={form.description}
                      onChange={(e) => onChange({ ...form, description: e.target.value })}
                      disabled={saving}
                    />
                  </div>

                  {!editingRule && (
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <input
                        type="checkbox"
                        checked={form.activate}
                        disabled={saving}
                        onChange={(e) =>
                          onChange({ ...form, activate: e.target.checked })
                        }
                      />
                      Activate immediately
                    </label>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 justify-end gap-3 border-t border-border px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="rounded-xl border border-input px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? 'Saving...' : editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function validateForm(form: DeliveryRuleFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.name.trim()) {
    errors.name = 'Name is required';
  }

  if (form.minimumOrderAmount < 0) {
    errors.minimumOrderAmount = 'Minimum order amount cannot be negative';
  }

  if (!form.isFreeDelivery && form.deliveryFee < 0) {
    errors.deliveryFee = 'Delivery fee cannot be negative';
  }

  if (!Number.isInteger(form.priority) || form.priority < 1) {
    errors.priority = 'Priority must be a positive integer';
  }

  return errors;
}

export default function DeliveryRulesPage() {
  const [rules, setRules] = useState<DeliveryRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DeliveryRule | null>(null);
  const [form, setForm] = useState<DeliveryRuleFormValues>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => a.priority - b.priority),
    [rules],
  );

  const loadRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await DeliveryRulesApi.list();
      setRules(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load delivery rules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  const deleteConfirm = useDeleteConfirm<DeliveryRule>({
    deleteFn: (rule) => DeliveryRulesApi.delete(rule.id),
    successMessage: 'Delivery rule deleted',
    errorMessage: 'Failed to delete delivery rule',
    onSuccess: loadRules,
  });

  const openCreate = () => {
    const nextPriority =
      rules.length > 0 ? Math.max(...rules.map((rule) => rule.priority)) + 1 : 1;

    setEditingRule(null);
    setForm({ ...emptyForm, priority: nextPriority });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (rule: DeliveryRule) => {
    setEditingRule(rule);
    setForm({
      name: rule.name,
      minimumOrderAmount: rule.minimumOrderAmount,
      deliveryFee: rule.deliveryFee,
      isFreeDelivery: rule.isFreeDelivery,
      priority: rule.priority,
      description: rule.description ?? '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        deliveryFee: form.isFreeDelivery ? 0 : form.deliveryFee,
      };

      if (editingRule) {
        await DeliveryRulesApi.update(editingRule.id, payload);
        toast.success('Delivery rule updated');
      } else {
        await DeliveryRulesApi.create(payload);
        toast.success('Delivery rule created');
      }

      setModalOpen(false);
      await loadRules();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save delivery rule');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (rule: DeliveryRule) => {
    setTogglingId(rule.id);
    try {
      if (rule.status === 'ACTIVE') {
        await DeliveryRulesApi.deactivate(rule.id);
        toast.success('Rule deactivated');
      } else {
        await DeliveryRulesApi.activate(rule.id);
        toast.success('Rule activated');
      }
      await loadRules();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update rule status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 font-sans">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Delivery Rules
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure delivery charges. The highest matching minimum order rule wins.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
        >
          <Plus size={16} />
          Create Rule
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Min Order</th>
                <th className="px-4 py-3">Delivery Fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto mb-2 animate-spin" size={20} />
                    Loading delivery rules...
                  </td>
                </tr>
              ) : sortedRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No delivery rules yet. System defaults apply when none are active.
                  </td>
                </tr>
              ) : (
                sortedRules.map((rule) => (
                  <tr key={rule.id} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">{rule.priority}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{rule.name}</div>
                      {rule.description && (
                        <div className="text-xs text-muted-foreground">{rule.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">₹{rule.minimumOrderAmount}</td>
                    <td className="px-4 py-3">
                      {rule.isFreeDelivery || rule.deliveryFee === 0
                        ? 'FREE'
                        : `₹${rule.deliveryFee}`}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                          rule.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(rule)}
                          className="rounded-lg border border-input p-2 text-muted-foreground hover:bg-muted"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleStatus(rule)}
                          disabled={togglingId === rule.id}
                          className="rounded-lg border border-input p-2 text-muted-foreground hover:bg-muted disabled:opacity-50"
                          title={rule.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        >
                          {togglingId === rule.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : rule.status === 'ACTIVE' ? (
                            <PowerOff size={14} />
                          ) : (
                            <Power size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteConfirm.open(rule)}
                          className="rounded-lg border border-destructive/30 p-2 text-destructive hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeliveryRuleFormModal
        open={modalOpen}
        editingRule={editingRule}
        form={form}
        saving={saving}
        formErrors={formErrors}
        onClose={() => !saving && setModalOpen(false)}
        onChange={setForm}
        onSubmit={handleSubmit}
      />

      <ConfirmDeleteDialog
        open={!!deleteConfirm.target}
        title="Delete Delivery Rule"
        description="This action cannot be undone. The rule will be permanently removed."
        itemLabel={deleteConfirm.target?.name ?? ''}
        loading={deleteConfirm.loading}
        onCancel={deleteConfirm.close}
        onConfirm={deleteConfirm.confirm}
      />
    </div>
  );
}
