import { Outlet } from '../domain/models/outlet.model';

export interface PublicOutletDto {
  id: string;
  name: string;
  branch?: string;
  status: string;
  workingState: { status: string };
  location: { latitude: number; longitude: number };
  deliveryRadiusKm: number;
  isCentral: boolean;
  distanceKm?: number;
}

export class PublicOutletMapper {
  static toDto(outlet: Outlet, distanceKm?: number): PublicOutletDto {
    const location = outlet.location?.getRaw();

    return {
      id: outlet.id,
      name: outlet.name,
      branch: outlet.branch,
      status: outlet.status,
      workingState: { status: outlet.workingState.getRaw() },
      location: location ?? { latitude: 0, longitude: 0 },
      deliveryRadiusKm: outlet.deliveryRadiusKm ?? 5,
      isCentral: outlet.isCentral,
      ...(distanceKm !== undefined ? { distanceKm } : {}),
    };
  }

  static toDtoList(
    items: { outlet: Outlet; distanceKm: number }[],
  ): PublicOutletDto[] {
    return items.map((item) => this.toDto(item.outlet, item.distanceKm));
  }
}
