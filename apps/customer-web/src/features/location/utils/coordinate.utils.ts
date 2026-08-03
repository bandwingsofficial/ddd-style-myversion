export type CoordinatePipelineStage =
  | 'GPS_RAW'
  | 'LOCATION_STORE'
  | 'API_REQUEST'
  | 'MANUAL_SELECTION'
  | 'SAVED_ADDRESS'
  | 'BOOTSTRAP_RESTORE'
  | 'RECENT_LOCATION';

export interface CoordinateTrace {
  stage: CoordinatePipelineStage;
  latitude: number;
  longitude: number;
  label?: string | null;
  source?: string | null;
  extra?: Record<string, unknown>;
}

export interface CoordinateValidation {
  valid: boolean;
  reason?: string;
  warning?: string;
}

export function validateCoordinates(
  latitude: number,
  longitude: number,
): CoordinateValidation {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { valid: false, reason: 'NOT_FINITE' };
  }

  if (latitude < -90 || latitude > 90) {
    return { valid: false, reason: 'LATITUDE_OUT_OF_RANGE' };
  }

  if (longitude < -180 || longitude > 180) {
    return { valid: false, reason: 'LONGITUDE_OUT_OF_RANGE' };
  }

  if (latitude > 20 && longitude < 20) {
    return {
      valid: true,
      warning: 'LIKELY_LAT_LNG_SWAPPED',
    };
  }

  if (latitude >= 12.5 && latitude <= 14 && longitude >= 76 && longitude < 77) {
    return {
      valid: true,
      warning: 'LIKELY_LONGITUDE_TYPO_76_INSTEAD_OF_77',
    };
  }

  return { valid: true };
}

export function traceCoordinates(trace: CoordinateTrace): void {
  const validation = validateCoordinates(trace.latitude, trace.longitude);

  const payload = {
    event: 'coordinate_pipeline',
    stage: trace.stage,
    latitude: trace.latitude,
    longitude: trace.longitude,
    label: trace.label ?? null,
    source: trace.source ?? null,
    validation,
    ...trace.extra,
  };

  if (!validation.valid) {
    console.error('[coordinates]', payload);
    return;
  }

  if (validation.warning) {
    console.warn('[coordinates]', payload);
    return;
  }

  console.info('[coordinates]', payload);
}

/** Great-circle distance in kilometres between two WGS84 points. */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function assertUsableCoordinates(
  latitude: number,
  longitude: number,
  stage: CoordinatePipelineStage,
): void {
  const validation = validateCoordinates(latitude, longitude);
  traceCoordinates({ stage, latitude, longitude, extra: { assert: true } });

  if (!validation.valid) {
    throw new Error(
      `Invalid coordinates at ${stage}: ${validation.reason ?? 'UNKNOWN'}`,
    );
  }
}
