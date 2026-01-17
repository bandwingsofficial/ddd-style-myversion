"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react"; // Removed MapPin to avoid duplicate icons
import { useLiveLocation } from "@/features/location/hooks/useLiveLocation";
import { reverseGeocode } from "@/features/location/utils/reverseGeocode";

export default function LocationSelector() {
  const { lat, lng, error } = useLiveLocation();
  const [address, setAddress] = useState("Detecting location...");

  // Helper to get clean "Area, City" format
  const formatLocation = (fullAddress: string) => {
    if (!fullAddress) return "Unknown Location";
    
    const parts = fullAddress.split(",").map((p) => p.trim());

    // Logic: If address is long (contains street, area, city, state...), 
    // try to grab the Area and City. 
    // Usually standard geocoders return: [Street, Area, City, State, Country]
    if (parts.length >= 3) {
      // Find the city part (heuristic: look for Bengaluru/Bangalore or take 2nd/3rd items)
      // This grabs the part before the City (usually Area) and the City itself.
      const cityIndex = parts.findIndex(p => 
        p.toLowerCase().includes("bengaluru") || 
        p.toLowerCase().includes("bangalore") ||
        p.toLowerCase().includes("city")
      );

      if (cityIndex > 0) {
        // Return "Area, City"
        return `${parts[cityIndex - 1]}, ${parts[cityIndex]}`;
      }

      // Fallback: Skip the first part (usually street) and show next two
      return `${parts[1]}, ${parts[2]}`;
    }

    return fullAddress;
  };

  useEffect(() => {
    if (lat && lng) {
      reverseGeocode(lat, lng).then((place) => {
        if (place) {
          // Format the address immediately when setting state
          setAddress(formatLocation(place));
        }
      });
    }
  }, [lat, lng]);

  return (
    <div style={styles.locationPicker}>
      {/* Icon removed here because it's now in the Header parent component */}
      
      <div style={styles.locationText}>
        <span style={styles.locationLabel}>Deliver to</span>
        <span style={styles.locationValue}>
          {error ? "Location unavailable" : address}
          <ChevronDown size={12} style={{ marginTop: '2px' }} />
        </span>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  locationPicker: { 
    display: "flex", 
    alignItems: "center", 
    gap: "0px", // Reduced gap since icon is gone
    cursor: "pointer",
    height: "100%"
  },
  // Removed locationIcon style as it is no longer used here
  locationText: { 
    display: "flex", 
    flexDirection: "column",
    justifyContent: "center"
  },
  locationLabel: { 
    fontSize: "0.65rem", 
    textTransform: "uppercase", 
    fontWeight: 700, 
    color: "#94a3b8", 
    lineHeight: "1.1",
    marginBottom: "1px"
  },
  locationValue: { 
    fontSize: "0.9rem", 
    fontWeight: 700, 
    color: "#334155", 
    display: "flex", 
    alignItems: "center", 
    gap: "4px",
    lineHeight: "1.2"
  }
};