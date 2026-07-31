export function unwrapApiList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.items)) {
      return record.items as T[];
    }

    if (Array.isArray(record.data)) {
      return record.data as T[];
    }
  }

  return [];
}

export function unwrapApiData<T>(payload: unknown): T | null {
  if (payload === null || payload === undefined) {
    return null;
  }

  return payload as T;
}
