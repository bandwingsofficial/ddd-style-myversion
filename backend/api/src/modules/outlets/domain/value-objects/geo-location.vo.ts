// src/modules/outlets/domain/value-objects/geo-location.vo.ts

import { ValidationError } from '../../../../common/errors';

export class GeoLocation {
  private readonly latitude: number;
  private readonly longitude: number;

  private constructor(latitude: number, longitude: number) {
    this.latitude = latitude;
    this.longitude = longitude;
    Object.freeze(this);
  }

  static create(lat: number, lng: number): GeoLocation {
    if (lat < -90 || lat > 90) {
      throw new ValidationError(
        'OUTLET_INVALID_LATITUDE',
        'Invalid latitude',
        { latitude: lat },
      );
    }

    if (lng < -180 || lng > 180) {
      throw new ValidationError(
        'OUTLET_INVALID_LONGITUDE',
        'Invalid longitude',
        { longitude: lng },
      );
    }

    return new GeoLocation(lat, lng);
  }

  /**
   * Create a new GeoLocation with partial updates
   */
  withUpdates(params: {
    latitude?: number;
    longitude?: number;
  }): GeoLocation {
    return GeoLocation.create(
      params.latitude ?? this.latitude,
      params.longitude ?? this.longitude,
    );
  }

  equals(other?: GeoLocation): boolean {
    if (!other) return false;
    return (
      this.latitude === other.latitude &&
      this.longitude === other.longitude
    );
  }

  /** Persistence only */
  getRaw(): { latitude: number; longitude: number } {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }
}
