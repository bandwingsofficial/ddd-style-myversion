export async function reverseGeocode(lat: number, lng: number) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}`
  );

  if (!res.ok) return null;

  const data = await res.json();

  return (
    data.features?.[0]?.place_name ??
    "Unknown location"
  );
}
