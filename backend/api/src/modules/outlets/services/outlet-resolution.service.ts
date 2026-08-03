import { Injectable } from '@nestjs/common';

import { pickPreferredOutlet } from '../../../common/utils/outlet-pick.util';
import { OutletOrchestratorService } from './outlet-orchestrator.service';
import {
  PublicOutletDto,
  PublicOutletMapper,
} from '../mappers/public-outlet.mapper';

export interface ResolvedDeliveryOutlet {
  outletId: string;
  outletName: string;
  distanceKm: number;
  outlet: PublicOutletDto;
}

export interface DeliveryOutletResolution {
  status: 'NO_SERVICE' | 'RESOLVED';
  resolvedOutlet: ResolvedDeliveryOutlet | null;
  nearbyOutlets: PublicOutletDto[];
}

@Injectable()
export class OutletResolutionService {
  constructor(private readonly outletOrchestrator: OutletOrchestratorService) {}

  async resolveForCoordinates(
    latitude: number,
    longitude: number,
  ): Promise<DeliveryOutletResolution> {
    const nearby = await this.outletOrchestrator.getNearbyOutlets(
      latitude,
      longitude,
    );

    const visible = nearby.filter((entry) => entry.outlet.isPubliclyVisible());
    const nearbyOutlets = PublicOutletMapper.toDtoList(visible);
    const picked = pickPreferredOutlet(visible);

    if (!picked) {
      return {
        status: 'NO_SERVICE',
        resolvedOutlet: null,
        nearbyOutlets: [],
      };
    }

    const outletDto =
      nearbyOutlets.find((outlet) => outlet.id === picked.outletId) ??
      PublicOutletMapper.toDto(
        visible.find((entry) => entry.outlet.id === picked.outletId).outlet,
        picked.distanceKm,
      );

    return {
      status: 'RESOLVED',
      resolvedOutlet: {
        outletId: picked.outletId,
        outletName: picked.outletName,
        distanceKm: picked.distanceKm,
        outlet: outletDto,
      },
      nearbyOutlets,
    };
  }
}
