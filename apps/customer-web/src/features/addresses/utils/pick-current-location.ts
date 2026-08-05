import { requestGpsOnce } from "@/features/location/utils/request-gps";
import {
  parseMapboxReverseGeocode,
  type ParsedGeocodedAddress,
} from "./parse-geocoded-address";

export type PickCurrentLocationResult =
  | ({
      ok: true;
      latitude: number;
      longitude: number;
    } & ParsedGeocodedAddress)
  | {
      ok: false;
      reason: "denied" | "unsupported" | "timeout" | "unavailable";
      message: string;
    };

async function fetchMapboxFeatures(latitude: number, longitude: number) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&types=address,poi,neighborhood,locality,place,postcode,region`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.features) ? data.features : [];
  } catch {
    return null;
  }
}

export async function reverseGeocodeDetailedForPicker(
  latitude: number,
  longitude: number,
): Promise<ParsedGeocodedAddress> {
  const features = await fetchMapboxFeatures(latitude, longitude);
  if (features?.length) {
    return parseMapboxReverseGeocode(features);
  }

  return {
    houseNumber: "",
    street: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
    area: "",
  };
}

export async function pickCurrentLocation(): Promise<PickCurrentLocationResult> {
  const gps = await requestGpsOnce();

  if (!gps.ok) {
    return {
      ok: false,
      reason: gps.reason,
      message:
        gps.reason === "denied"
          ? "We couldn't access your location. You can still enter your address manually below."
          : gps.message,
    };
  }

  const parsed = await reverseGeocodeDetailedForPicker(
    gps.latitude,
    gps.longitude,
  );

  return {
    ok: true,
    latitude: gps.latitude,
    longitude: gps.longitude,
    ...parsed,
  };
}

/** @deprecated use reverseGeocodeDetailedForPicker */
export async function reverseGeocodeForPicker(
  latitude: number,
  longitude: number,
): Promise<{ area: string; pincode: string }> {
  const parsed = await reverseGeocodeDetailedForPicker(latitude, longitude);
  return { area: parsed.area || parsed.street, pincode: parsed.pincode };
}

export type { ParsedGeocodedAddress };
