"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Map, { Marker, type MapMouseEvent, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const FLY_DURATION_MS = 550;

interface AddressLocationMapPreviewProps {
  latitude: number;
  longitude: number;
  onLocationChange: (latitude: number, longitude: number) => void;
  className?: string;
}

export function AddressLocationMapPreview({
  latitude,
  longitude,
  onLocationChange,
  className = "",
}: AddressLocationMapPreviewProps) {
  const mapRef = useRef<MapRef>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const suppressMapClickRef = useRef(false);
  const lastExternalCoordsRef = useRef({ latitude, longitude });

  const [marker, setMarker] = useState({ latitude, longitude });
  const [viewState, setViewState] = useState({
    longitude,
    latitude,
    zoom: 16,
  });

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  const flyToMarker = useCallback((lat: number, lng: number) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    map.flyTo({
      center: [lng, lat],
      zoom: Math.max(map.getZoom(), 16),
      duration: FLY_DURATION_MS,
      essential: true,
    });
  }, []);

  const commitLocation = useCallback(
    (lat: number, lng: number) => {
      lastExternalCoordsRef.current = { latitude: lat, longitude: lng };
      setMarker({ latitude: lat, longitude: lng });
      setViewState((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      flyToMarker(lat, lng);
      onLocationChangeRef.current(lat, lng);
    },
    [flyToMarker],
  );

  useEffect(() => {
    const prev = lastExternalCoordsRef.current;
    const unchanged =
      prev.latitude === latitude &&
      prev.longitude === longitude;

    lastExternalCoordsRef.current = { latitude, longitude };

    if (unchanged) return;

    setMarker({ latitude, longitude });
    setViewState((current) => ({
      ...current,
      latitude,
      longitude,
    }));
    flyToMarker(latitude, longitude);
  }, [latitude, longitude, flyToMarker]);

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (suppressMapClickRef.current) return;
      commitLocation(event.lngLat.lat, event.lngLat.lng);
    },
    [commitLocation],
  );

  const handleMarkerDragEnd = useCallback(
    (event: { lngLat: { lat: number; lng: number } }) => {
      suppressMapClickRef.current = true;
      commitLocation(event.lngLat.lat, event.lngLat.lng);
      window.setTimeout(() => {
        suppressMapClickRef.current = false;
      }, 100);
    },
    [commitLocation],
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={`flex h-[280px] items-center justify-center bg-slate-100 px-4 text-center text-xs text-slate-500 ${className}`}
      >
        Map preview is unavailable. You can still enter your address manually.
      </div>
    );
  }

  return (
    <div className={`relative bg-slate-100 ${className}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        {...viewState}
        onMove={(event) => setViewState(event.viewState)}
        onClick={handleMapClick}
        style={{ width: "100%", height: 280 }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        attributionControl={false}
        cursor="crosshair"
        reuseMaps
      >
        <Marker
          longitude={marker.longitude}
          latitude={marker.latitude}
          anchor="bottom"
          draggable
          onDragStart={() => {
            suppressMapClickRef.current = true;
          }}
          onDragEnd={handleMarkerDragEnd}
          onClick={(event) => {
            event.originalEvent.stopPropagation();
          }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-600 shadow-md">
            <div className="h-2.5 w-2.5 rounded-full bg-white" />
          </div>
        </Marker>
      </Map>
    </div>
  );
}
