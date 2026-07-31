'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import DiscardChangesDialog from '@/features/categories/components/discard-changes-dialog';
import { OutletsApi } from '../api/outlets.api';
import { Outlet, OutletFormErrors } from '../types/outlet.types';
import {
  formInputClassName,
  getApiErrorMessage,
  mapServerFieldErrors,
  UNEXPECTED_ERROR_TOAST,
  validateCameraStreamUrl,
  validateCoordinate,
  validateDeliveryRadius,
  validateOutletAddress,
  validateOutletName,
  validateOutletPincode,
} from '../utils/outlet-validation';

type OutletFormMode = 'create' | 'edit';

interface Props {
  mode: OutletFormMode;
  open: boolean;
  outlet?: Outlet | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormSnapshot {
  name: string;
  branch: string;
  address: string;
  pincode: string;
  latitude: string;
  longitude: string;
  deliveryRadiusKm: string;
  cameraEnabled: boolean;
  cameraStreamUrl: string;
}

const EMPTY_SNAPSHOT: FormSnapshot = {
  name: '',
  branch: '',
  address: '',
  pincode: '',
  latitude: '',
  longitude: '',
  deliveryRadiusKm: '',
  cameraEnabled: false,
  cameraStreamUrl: '',
};

function snapshotFromOutlet(outlet: Outlet): FormSnapshot {
  return {
    name: outlet.name ?? '',
    branch: outlet.branch ?? '',
    address: outlet.address ?? '',
    pincode: outlet.pincode ?? '',
    latitude: String(outlet.location?.latitude ?? ''),
    longitude: String(outlet.location?.longitude ?? ''),
    deliveryRadiusKm: String(outlet.deliveryRadiusKm ?? ''),
    cameraEnabled: outlet.cameraState?.enabled === true,
    cameraStreamUrl:
      outlet.cameraState?.streamUrl ??
      outlet.cameraState?.cameraStreamUrl ??
      '',
  };
}

export default function OutletFormModal({
  mode,
  open,
  outlet = null,
  onClose,
  onSuccess,
}: Props) {
  const isCreate = mode === 'create';
  const [form, setForm] = useState<FormSnapshot>(EMPTY_SNAPSHOT);
  const [errors, setErrors] = useState<OutletFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [initialSnapshot, setInitialSnapshot] =
    useState<FormSnapshot>(EMPTY_SNAPSHOT);

  const resetForm = useCallback(() => {
    if (isCreate) {
      setForm(EMPTY_SNAPSHOT);
      setInitialSnapshot(EMPTY_SNAPSHOT);
    } else if (outlet) {
      const snapshot = snapshotFromOutlet(outlet);
      setForm(snapshot);
      setInitialSnapshot(snapshot);
    }

    setErrors({});
    setSubmitting(false);
    setShowDiscardDialog(false);
  }, [isCreate, outlet]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialSnapshot),
    [form, initialSnapshot],
  );

  const validateForm = (): OutletFormErrors => {
    const nextErrors: OutletFormErrors = {
      name: validateOutletName(form.name),
      address: validateOutletAddress(form.address),
      pincode: validateOutletPincode(form.pincode),
      latitude: validateCoordinate(form.latitude, 'Latitude'),
      longitude: validateCoordinate(form.longitude, 'Longitude'),
      deliveryRadiusKm: validateDeliveryRadius(form.deliveryRadiusKm),
      cameraStreamUrl: validateCameraStreamUrl(
        form.cameraStreamUrl,
        form.cameraEnabled,
      ),
    };

    return Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => Boolean(value)),
    );
  };

  const requestClose = () => {
    if (submitting) {
      return;
    }

    if (isDirty) {
      setShowDiscardDialog(true);
      return;
    }

    onClose();
  };

  const handleSubmit = async () => {
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        branch: form.branch.trim() || undefined,
        address: form.address.trim(),
        pincode: form.pincode.trim(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        deliveryRadiusKm: Number(form.deliveryRadiusKm),
      };

      if (isCreate) {
        const created = await OutletsApi.create({
          ...payload,
          cameraEnabled: form.cameraEnabled,
        });

        await OutletsApi.configureCamera(created.id, {
          enabled: form.cameraEnabled,
          streamUrl: form.cameraEnabled
            ? form.cameraStreamUrl.trim()
            : undefined,
        });

        toast.success('Outlet created successfully.');
      } else if (outlet) {
        await OutletsApi.update(outlet.id, payload);

        await OutletsApi.configureCamera(outlet.id, {
          enabled: form.cameraEnabled,
          streamUrl: form.cameraEnabled
            ? form.cameraStreamUrl.trim()
            : undefined,
        });

        toast.success('Outlet updated successfully.');
      }

      onSuccess();
      onClose();
    } catch (error) {
      const fieldErrors = mapServerFieldErrors(
        (error as { response?: { data?: { errors?: Record<string, string> } } })
          ?.response?.data,
      );

      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        toast.error(
          getApiErrorMessage(
            error,
            isCreate ? 'Failed to create outlet.' : 'Failed to update outlet.',
          ),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          onClick={requestClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="outlet-form-title"
            className="flex max-h-[90vh] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between border-b border-border px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="outlet-form-title"
                  className="text-lg font-bold tracking-tight text-foreground"
                >
                  {isCreate ? 'Create Outlet' : 'Edit Outlet'}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {isCreate
                    ? 'Register a new branch location.'
                    : `Updating ${outlet?.name ?? 'outlet'}`}
                </p>
              </div>
              <button
                type="button"
                onClick={requestClose}
                disabled={submitting}
                aria-label="Close"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSubmit();
              }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-foreground">
                      Outlet Name <span className="text-destructive">*</span>
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
                          name: validateOutletName(form.name),
                        }))
                      }
                      disabled={submitting}
                      className={formInputClassName(!!errors.name)}
                      placeholder="e.g. Bengaluru Central"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">
                      Branch Name
                    </label>
                    <input
                      value={form.branch}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          branch: event.target.value,
                        }))
                      }
                      disabled={submitting}
                      className={formInputClassName(!!errors.branch)}
                      placeholder="e.g. B1"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">
                      Delivery Radius (km){' '}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.deliveryRadiusKm}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          deliveryRadiusKm: event.target.value,
                        }))
                      }
                      onBlur={() =>
                        setErrors((current) => ({
                          ...current,
                          deliveryRadiusKm: validateDeliveryRadius(
                            form.deliveryRadiusKm,
                          ),
                        }))
                      }
                      disabled={submitting}
                      className={formInputClassName(!!errors.deliveryRadiusKm)}
                    />
                    {errors.deliveryRadiusKm && (
                      <p className="text-sm text-destructive">
                        {errors.deliveryRadiusKm}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-foreground">
                      Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      value={form.address}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          address: event.target.value,
                        }))
                      }
                      onBlur={() =>
                        setErrors((current) => ({
                          ...current,
                          address: validateOutletAddress(form.address),
                        }))
                      }
                      disabled={submitting}
                      className={formInputClassName(!!errors.address)}
                      placeholder="Full street address"
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive">
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">
                      Pincode <span className="text-destructive">*</span>
                    </label>
                    <input
                      value={form.pincode}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          pincode: event.target.value,
                        }))
                      }
                      onBlur={() =>
                        setErrors((current) => ({
                          ...current,
                          pincode: validateOutletPincode(form.pincode),
                        }))
                      }
                      disabled={submitting}
                      className={formInputClassName(!!errors.pincode)}
                    />
                    {errors.pincode && (
                      <p className="text-sm text-destructive">
                        {errors.pincode}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">
                      Latitude <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          latitude: event.target.value,
                        }))
                      }
                      onBlur={() =>
                        setErrors((current) => ({
                          ...current,
                          latitude: validateCoordinate(
                            form.latitude,
                            'Latitude',
                          ),
                        }))
                      }
                      disabled={submitting}
                      className={formInputClassName(!!errors.latitude)}
                    />
                    {errors.latitude && (
                      <p className="text-sm text-destructive">
                        {errors.latitude}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">
                      Longitude <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          longitude: event.target.value,
                        }))
                      }
                      onBlur={() =>
                        setErrors((current) => ({
                          ...current,
                          longitude: validateCoordinate(
                            form.longitude,
                            'Longitude',
                          ),
                        }))
                      }
                      disabled={submitting}
                      className={formInputClassName(!!errors.longitude)}
                    />
                    {errors.longitude && (
                      <p className="text-sm text-destructive">
                        {errors.longitude}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3">
                      <input
                        type="checkbox"
                        checked={form.cameraEnabled}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            cameraEnabled: event.target.checked,
                            cameraStreamUrl: event.target.checked
                              ? current.cameraStreamUrl
                              : '',
                          }))
                        }
                        disabled={submitting}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm font-medium text-foreground">
                        Enable live camera
                      </span>
                    </label>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-foreground">
                      Camera Stream URL{' '}
                      {form.cameraEnabled ? (
                        <span className="text-destructive">*</span>
                      ) : null}
                    </label>
                    <input
                      value={form.cameraStreamUrl}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          cameraStreamUrl: event.target.value,
                        }))
                      }
                      onBlur={() =>
                        setErrors((current) => ({
                          ...current,
                          cameraStreamUrl: validateCameraStreamUrl(
                            form.cameraStreamUrl,
                            form.cameraEnabled,
                          ),
                        }))
                      }
                      disabled={submitting || !form.cameraEnabled}
                      className={formInputClassName(!!errors.cameraStreamUrl)}
                      placeholder="rtsp:// or https://"
                    />
                    <p className="text-xs text-muted-foreground">
                      {form.cameraEnabled
                        ? 'Required when live camera is enabled.'
                        : 'Enable live camera to configure a stream URL.'}
                    </p>
                    {errors.cameraStreamUrl && (
                      <p className="text-sm text-destructive">
                        {errors.cameraStreamUrl}
                      </p>
                    )}
                  </div>
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
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : isCreate ? (
                    'Create Outlet'
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
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
