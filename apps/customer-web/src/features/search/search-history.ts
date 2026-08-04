const STORAGE_KEY = "product_search_history_v1";
const MAX_HISTORY = 5;

export function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item === "string").slice(0, MAX_HISTORY)
      : [];
  } catch {
    return [];
  }
}

export function addSearchHistory(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed || typeof window === "undefined") return getSearchHistory();

  const next = [
    trimmed,
    ...getSearchHistory().filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase(),
    ),
  ].slice(0, MAX_HISTORY);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
