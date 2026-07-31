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
