import { GeoLocation } from '../domain/value-objects/geo-location.vo';

export class GeoLocationMapper {
  static toDomain(
    latitude?: number | null,
    longitude?: number | null,
  ): GeoLocation | undefined {
    if (
      latitude === null ||
      latitude === undefined ||
      longitude === null ||
      longitude === undefined
    ) {
      return undefined;
    }

    return GeoLocation.create(latitude, longitude);
  }

  static toPrisma(location?: GeoLocation): {
    latitude: number | null;
    longitude: number | null;
  } {
    if (!location) {
      return {
        latitude: null,
        longitude: null,
      };
    }

    const raw = location.getRaw();

    return {
      latitude: raw.latitude,
      longitude: raw.longitude,
    };
  }
}
