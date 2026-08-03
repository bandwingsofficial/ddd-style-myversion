import type { RecentLocation } from "./location.types";

const RECENT_LOCATIONS_KEY = "customer-recent-locations";
const MAX_RECENT_LOCATIONS = 5;

export function getRecentLocations(): RecentLocation[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(RECENT_LOCATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentLocation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentLocation(location: Omit<RecentLocation, "searchedAt">): void {
  if (typeof window === "undefined") return;

  const nextEntry: RecentLocation = {
    ...location,
    searchedAt: Date.now(),
  };

  const existing = getRecentLocations().filter(
    (item) =>
      item.latitude.toFixed(5) !== nextEntry.latitude.toFixed(5) ||
      item.longitude.toFixed(5) !== nextEntry.longitude.toFixed(5),
  );

  const next = [nextEntry, ...existing].slice(0, MAX_RECENT_LOCATIONS);
  localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(next));
}

export function getUserLocationStorageKey(userId?: string | null): string {
  return userId
    ? `customer-location-storage:${userId}`
    : "customer-location-storage";
}
