// features/location/utils/geocoding.ts

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// 1. REVERSE: Lat/Lng -> Address String
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  if (!MAPBOX_TOKEN) {
    console.error("Mapbox token missing");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.features?.[0]?.place_name ?? "Unknown location";
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

// 2. FORWARD: Address String -> Lat/Lng
export async function forwardGeocode(searchText: string) {
  if (!MAPBOX_TOKEN || !searchText || searchText.length < 5) return null;

  try {
    // Encodes the address safely for URL
    const query = encodeURIComponent(searchText);
    
    // We limit to 1 result for efficiency
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}&limit=1`
    );

    if (!res.ok) return null;

    const data = await res.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center; // Mapbox returns [lng, lat]
      return { lat, lng };
    }
    
    return null;
  } catch (error) {
    console.error("Forward geocoding error:", error);
    return null;
  }
}