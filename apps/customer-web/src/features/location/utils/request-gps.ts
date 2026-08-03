const GPS_TIMEOUT_MS = 10_000;

export interface GpsResult {
  ok: true;
  latitude: number;
  longitude: number;
}

export interface GpsFailure {
  ok: false;
  reason: "unsupported" | "denied" | "timeout" | "unavailable";
  message: string;
}

export type GpsRequestResult = GpsResult | GpsFailure;

export function requestGpsOnce(signal?: AbortSignal): Promise<GpsRequestResult> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve({
        ok: false,
        reason: "unsupported",
        message: "Geolocation is not supported",
      });
      return;
    }

    if (signal?.aborted) {
      resolve({
        ok: false,
        reason: "unavailable",
        message: "Cancelled",
      });
      return;
    }

    let settled = false;
    const finish = (result: GpsRequestResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      resolve(result);
    };

    const onAbort = () => {
      finish({
        ok: false,
        reason: "unavailable",
        message: "Cancelled",
      });
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    const timer = setTimeout(() => {
      finish({
        ok: false,
        reason: "timeout",
        message: "Location request timed out",
      });
    }, GPS_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        if (process.env.NODE_ENV !== "production") {
          console.info("[coordinates]", {
            event: "coordinate_pipeline",
            stage: "GPS_RAW",
            latitude,
            longitude,
            accuracyMeters: position.coords.accuracy,
          });
        }

        finish({
          ok: true,
          latitude,
          longitude,
        });
      },
      (error) => {
        const reason =
          error.code === error.PERMISSION_DENIED
            ? "denied"
            : error.code === error.TIMEOUT
              ? "timeout"
              : "unavailable";

        finish({
          ok: false,
          reason,
          message: error.message || "Unable to get location",
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: GPS_TIMEOUT_MS,
      },
    );
  });
}
