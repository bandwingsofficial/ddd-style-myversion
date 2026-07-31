'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { getApiErrorMessage } from '@/lib/api-error';

interface UseDeleteConfirmOptions<T> {
  deleteFn: (item: T) => Promise<unknown>;
  successMessage: string;
  errorMessage: string;
  onSuccess: () => void;
  getItemId?: (item: T) => string;
}

export function useDeleteConfirm<T>({
  deleteFn,
  successMessage,
  errorMessage,
  onSuccess,
  getItemId,
}: UseDeleteConfirmOptions<T>) {
  const [target, setTarget] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const targetRef = useRef<T | null>(null);

  const open = useCallback((item: T) => {
    targetRef.current = item;
    setTarget(item);
  }, []);

  const close = useCallback(() => {
    if (loading) {
      return;
    }

    targetRef.current = null;
    setTarget(null);
  }, [loading]);

  const confirm = useCallback(async () => {
    const item = targetRef.current;

    if (!item || loading) {
      return;
    }

    setLoading(true);

    try {
      await deleteFn(item);
      toast.success(successMessage);
      targetRef.current = null;
      setTarget(null);
      onSuccess();
    } catch (error) {
      toast.error(getApiErrorMessage(error, errorMessage));
    } finally {
      setLoading(false);
    }
  }, [deleteFn, errorMessage, loading, onSuccess, successMessage]);

  const getTargetId = useCallback(() => {
    if (!target) {
      return undefined;
    }

    if (getItemId) {
      return getItemId(target);
    }

    if (typeof target === 'object' && target !== null && 'id' in target) {
      return String((target as { id: string }).id);
    }

    return undefined;
  }, [getItemId, target]);

  return {
    target,
    loading,
    open,
    close,
    confirm,
    targetId: getTargetId(),
  };
}
