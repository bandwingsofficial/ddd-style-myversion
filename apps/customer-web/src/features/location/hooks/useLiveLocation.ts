"use client";

import { useEffect, useState } from "react";

export interface LiveLocation {
  lat: number | null;
  lng: number | null;
  error: string | null;
}

export function useLiveLocation() {
  const [location, setLocation] = useState<LiveLocation>({
    lat: null,
    lng: null,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ lat: null, lng: null, error: "Geolocation not supported" });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
        });
      },
      (err) => {
        setLocation({ lat: null, lng: null, error: err.message });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return location;
}
