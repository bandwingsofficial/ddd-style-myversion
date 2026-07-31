'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  DeleteAnalysis,
  DELETE_ERROR_CODES,
  parseDeleteError,
} from '@/lib/delete-analysis';

interface UseSmartDeleteOptions<T> {
  deleteFn: (item: T, options?: { force?: boolean }) => Promise<unknown>;
  successMessage: string;
  errorMessage: string;
  onSuccess: () => void;
  getItemLabel?: (item: T) => string;
}

export function useSmartDelete<T>({
  deleteFn,
  successMessage,
  errorMessage,
  onSuccess,
  getItemLabel,
}: UseSmartDeleteOptions<T>) {
  const [target, setTarget] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [forceAnalysis, setForceAnalysis] = useState<DeleteAnalysis | null>(
    null,
  );
  const [blockedAnalysis, setBlockedAnalysis] =
    useState<DeleteAnalysis | null>(null);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const targetRef = useRef<T | null>(null);

  const reset = useCallback(() => {
    targetRef.current = null;
    setTarget(null);
    setForceAnalysis(null);
    setBlockedAnalysis(null);
    setBlockedMessage(null);
  }, []);

  const open = useCallback((item: T) => {
    targetRef.current = item;
    setTarget(item);
    setForceAnalysis(null);
    setBlockedAnalysis(null);
    setBlockedMessage(null);
  }, []);

  const close = useCallback(() => {
    if (loading) {
      return;
    }

    reset();
  }, [loading, reset]);

  const performDelete = useCallback(
    async (options?: { force?: boolean }) => {
      const item = targetRef.current;

      if (!item || loading) {
        return;
      }

      setLoading(true);

      try {
        await deleteFn(item, options);
        toast.success(successMessage);
        reset();
        onSuccess();
      } catch (error) {
        const parsed = parseDeleteError(error);

        if (
          parsed.code === DELETE_ERROR_CODES.REQUIRES_FORCE &&
          parsed.deleteAnalysis
        ) {
          setForceAnalysis(parsed.deleteAnalysis);
          return;
        }

        if (
          parsed.code === DELETE_ERROR_CODES.BLOCKED &&
          parsed.deleteAnalysis
        ) {
          setBlockedAnalysis(parsed.deleteAnalysis);
          setBlockedMessage(parsed.message);
          return;
        }

        toast.error(parsed.message || errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [deleteFn, errorMessage, loading, onSuccess, reset, successMessage],
  );

  const confirm = useCallback(async () => {
    await performDelete();
  }, [performDelete]);

  const confirmForce = useCallback(async () => {
    await performDelete({ force: true });
  }, [performDelete]);

  const getLabel = useCallback(() => {
    if (!target) {
      return '';
    }

    if (getItemLabel) {
      return getItemLabel(target);
    }

    if (typeof target === 'object' && target !== null && 'name' in target) {
      return String((target as { name: string }).name);
    }

    return '';
  }, [getItemLabel, target]);

  return {
    target,
    loading,
    forceAnalysis,
    blockedAnalysis,
    blockedMessage,
    itemLabel: getLabel(),
    open,
    close,
    confirm,
    confirmForce,
    closeBlocked: () => {
      setBlockedAnalysis(null);
      setBlockedMessage(null);
    },
    closeForce: () => setForceAnalysis(null),
  };
}
