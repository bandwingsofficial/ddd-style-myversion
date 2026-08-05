export interface ParsedGeocodedAddress {
  houseNumber: string;
  street: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
  area: string;
}

export function extractAreaAndPincode(addressString: string): {
  area: string;
  pincode: string;
} {
  let extractedPincode = "";
  const pincodeMatch = addressString.match(/\b\d{6}\b/);
  if (pincodeMatch) extractedPincode = pincodeMatch[0];

  const cleanArea = addressString
    .replace(extractedPincode, "")
    .replace(/,\s*$/, "")
    .replace(/,\s*India$/, "")
    .trim();

  return { area: cleanArea, pincode: extractedPincode };
}

type MapboxContextItem = { id?: string; text?: string };
type MapboxFeature = {
  place_name?: string;
  text?: string;
  address?: string;
  place_type?: string[];
  context?: MapboxContextItem[];
};

function contextText(
  feature: MapboxFeature | undefined,
  prefix: string,
): string {
  return (
    feature?.context?.find((item) => item.id?.startsWith(prefix))?.text?.trim() ??
    ""
  );
}

export function parseMapboxReverseGeocode(
  features: MapboxFeature[],
): ParsedGeocodedAddress {
  if (!features.length) {
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

  const addressFeature =
    features.find((feature) => feature.place_type?.includes("address")) ??
    features[0];

  const poiFeature = features.find((feature) =>
    feature.place_type?.includes("poi"),
  );

  const pincode = contextText(addressFeature, "postcode");
  const locality = contextText(addressFeature, "locality");
  const neighborhood = contextText(addressFeature, "neighborhood");
  const city =
    contextText(addressFeature, "place") ||
    locality ||
    contextText(addressFeature, "district");
  const state = contextText(addressFeature, "region");

  const houseNumber = addressFeature.address?.trim() ?? "";
  const streetFromFeature =
    addressFeature.place_type?.includes("address") && addressFeature.text
      ? addressFeature.text.trim()
      : "";

  const streetParts = [neighborhood, streetFromFeature].filter(Boolean);
  const street = streetParts.length
    ? [...new Set(streetParts)].join(", ")
    : addressFeature.text?.trim() ?? "";

  const area =
    street ||
    extractAreaAndPincode(addressFeature.place_name ?? "").area ||
    city;

  return {
    houseNumber,
    street: street || area,
    landmark: poiFeature?.text?.trim() ?? "",
    pincode,
    city,
    state,
    area: street || area,
  };
}
