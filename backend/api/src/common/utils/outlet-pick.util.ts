import { Outlet } from '../../modules/outlets/domain/models/outlet.model';

export interface NearbyOutletEntry {
  outlet: Outlet;
  distanceKm: number;
}

export interface ResolvedOutlet {
  outletId: string;
  outletName: string;
  distanceKm: number;
}

/** Prefer nearest open outlet; fallback to nearest serviceable outlet. */
export function pickPreferredOutlet(
  nearby: NearbyOutletEntry[],
): ResolvedOutlet | null {
  if (nearby.length === 0) return null;

  const sorted = [...nearby].sort((left, right) => {
    const distanceDiff = left.distanceKm - right.distanceKm;
    if (distanceDiff !== 0) return distanceDiff;

    const leftOpen = left.outlet.workingState?.isOpen?.() ? 0 : 1;
    const rightOpen = right.outlet.workingState?.isOpen?.() ? 0 : 1;
    return leftOpen - rightOpen;
  });

  const openOutlet = sorted.find((entry) =>
    entry.outlet.workingState?.isOpen?.(),
  );
  const picked = openOutlet ?? sorted[0];

  return {
    outletId: picked.outlet.id,
    outletName: picked.outlet.name,
    distanceKm: picked.distanceKm,
  };
}
