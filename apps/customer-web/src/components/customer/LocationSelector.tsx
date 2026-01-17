"use client";

import { useEffect, useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import { useLiveLocation } from "@/features/location/hooks/useLiveLocation";
import { reverseGeocode } from "@/features/location/utils/reverseGeocode";

export default function LocationSelector() {
  const { lat, lng, error } = useLiveLocation();
  const [address, setAddress] = useState("Detecting location...");

  useEffect(() => {
    if (lat && lng) {
      reverseGeocode(lat, lng).then((place) => {
        if (place) setAddress(place);
      });
    }
  }, [lat, lng]);

  return (
    <div style={styles.locationPicker}>
      <div style={styles.locationIcon}>
        <MapPin size={14} />
      </div>
      <div style={styles.locationText}>
        <span style={styles.locationLabel}>Deliver to</span>
        <span style={styles.locationValue}>
          {error ? "Location unavailable" : address}
          <ChevronDown size={12} />
        </span>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  locationPicker: { display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" },
  locationIcon: { background: "#f1f5f9", padding: "6px", borderRadius: "50%", display: "flex", color: "#64748b" },
  locationText: { display: "flex", flexDirection: "column" },
  locationLabel: { fontSize: "0.65rem", textTransform: "uppercase", fontWeight: 600, color: "#94a3b8", lineHeight: 1 },
  locationValue: { fontSize: "0.85rem", fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: "2px" }
};
