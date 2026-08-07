import { Outlet } from '../domain/models/outlet.model';
import { OutletProfile } from '../domain/models/outlet-profile.model';

/** Extra outlet columns used only for public API enrichment. */
export interface OutletPublicExtras {
  displayName?: string;
  code?: string;
  alternatePhone?: string;
  addressLine2?: string;
  landmark?: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
  formattedAddress?: string;
  locationText?: string;
  openingTime?: string;
  closingTime?: string;
  estimatedDeliveryMinutes?: number;
  googleMapsUrl?: string;
  supportWhatsapp?: string;
}

export interface OutletPublicBundle {
  outlet: Outlet;
  profile: OutletProfile | null;
  extras: OutletPublicExtras;
}

export interface OutletPublicBundleWithDistance extends OutletPublicBundle {
  distanceKm: number;
}
