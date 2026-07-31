export interface DeleteBlocker {
  type: string;
  label: string;
  count: number;
}

export interface DeleteAnalysis {
  canDelete: boolean;
  canForceDelete: boolean;
  permanentBlockers: DeleteBlocker[];
  removableDependencies: DeleteBlocker[];
  forceDeleteActions?: string[];
}

export const DELETE_ERROR_CODES = {
  BLOCKED: 'DELETE_BLOCKED',
  REQUIRES_FORCE: 'DELETE_REQUIRES_FORCE',
} as const;

export function parseDeleteError(error: unknown): {
  message: string;
  code?: string;
  deleteAnalysis?: DeleteAnalysis;
} {
  const axiosError = error as {
    response?: {
      data?: {
        message?: string | string[];
        code?: string;
        deleteAnalysis?: DeleteAnalysis;
      };
    };
    message?: string;
  };

  const data = axiosError.response?.data;
  const rawMessage = data?.message;
  const message = Array.isArray(rawMessage)
    ? rawMessage[0] ?? 'Delete failed.'
    : rawMessage ?? axiosError.message ?? 'Delete failed.';

  return {
    message,
    code: data?.code,
    deleteAnalysis: data?.deleteAnalysis,
  };
}

export function formatBlockerList(blockers: DeleteBlocker[]): string {
  return blockers
    .map((blocker) => `• ${blocker.count} ${blocker.label}`)
    .join('\n');
}
