// src/modules/outlets/mappers/geo-location.mapper.ts

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
    latitude?: number;
    longitude?: number;
  } {
    if (!location) return {};

    return location.getRaw();
  }
}
