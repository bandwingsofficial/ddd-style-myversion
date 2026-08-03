const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export interface PlaceSuggestion {
  id: string;
  label: string;
  placeName: string;
  latitude: number;
  longitude: number;
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string | null> {
  if (!MAPBOX_TOKEN) {
    console.error("Mapbox token missing");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`,
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.features?.[0]?.place_name ?? "Unknown location";
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

export async function forwardGeocode(searchText: string) {
  if (!MAPBOX_TOKEN || !searchText || searchText.length < 3) return null;

  try {
    const query = encodeURIComponent(searchText);
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}&limit=1&country=in`,
    );

    if (!res.ok) return null;

    const data = await res.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [lng, lat] = feature.center;
      return {
        lat,
        lng,
        placeName: feature.place_name as string,
      };
    }

    return null;
  } catch (error) {
    console.error("Forward geocoding error:", error);
    return null;
  }
}

export async function searchPlaces(
  searchText: string,
  limit = 5,
): Promise<PlaceSuggestion[]> {
  if (!MAPBOX_TOKEN || !searchText || searchText.trim().length < 2) {
    return [];
  }

  try {
    const query = encodeURIComponent(searchText.trim());
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}&limit=${limit}&country=in&types=place,locality,neighborhood,address,poi`,
    );

    if (!res.ok) return [];

    const data = await res.json();
    const features = Array.isArray(data.features) ? data.features : [];

    return features.map((feature: any) => {
      const [lng, lat] = feature.center;
      return {
        id: String(feature.id),
        label: feature.text as string,
        placeName: feature.place_name as string,
        latitude: lat,
        longitude: lng,
      };
    });
  } catch (error) {
    console.error("Place search error:", error);
    return [];
  }
}
