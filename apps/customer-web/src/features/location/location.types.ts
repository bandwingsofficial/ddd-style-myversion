export type LocationSource = "gps" | "manual" | "saved";

/** Customer delivery address — drives serviceability and checkout. */
export interface DeliveryAddress {
  latitude: number;
  longitude: number;
  addressLabel: string;
  formattedAddress: string;
  source: LocationSource;
  updatedAt: number;
}

/** Device GPS fix — independent from delivery address. */
export interface GpsLocation {
  latitude: number;
  longitude: number;
  label: string;
  updatedAt: number;
}

/** @deprecated Use DeliveryAddress — persisted fields are the delivery address. */
export type CustomerLocation = DeliveryAddress;

export interface RecentLocation {
  latitude: number;
  longitude: number;
  label: string;
  formattedAddress: string;
  searchedAt: number;
}

export function buildLocationKey(lat: number, lng: number): string {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

export function formatLocationLabel(placeName: string | null | undefined): string {
  if (!placeName?.trim()) {
    return "Current Location";
  }

  const parts = placeName.split(",").map((part) => part.trim());
  const cleanParts = parts.filter(
    (part) => part !== "India" && !/^\d{6}$/.test(part),
  );
  const uniqueParts = [...new Set(cleanParts)];

  if (uniqueParts.length > 3) {
    return uniqueParts.slice(1, 3).join(", ");
  }

  return uniqueParts.slice(0, 2).join(", ");
}
