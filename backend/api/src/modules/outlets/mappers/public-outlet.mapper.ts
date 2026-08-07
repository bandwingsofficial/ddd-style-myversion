import { Outlet } from '../domain/models/outlet.model';
import { OutletProfile } from '../domain/models/outlet-profile.model';
import {
  OutletPublicBundle,
  OutletPublicBundleWithDistance,
  OutletPublicExtras,
} from '../types/outlet-public-bundle.types';

export interface PublicOutletAddressDto {
  line1?: string;
  line2?: string;
  landmark?: string;
  area?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
}

export interface PublicOutletBusinessHoursDto {
  openingTime?: string;
  closingTime?: string;
}

export interface PublicOutletDeliveryDto {
  radiusKm: number;
  estimatedMinutes?: number;
}

export interface PublicOutletSupportDto {
  phone?: string;
  email?: string;
  whatsapp?: string;
}

/** Backward-compatible public outlet response — existing fields unchanged. */
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

  // Appended metadata (optional)
  displayName?: string;
  code?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: PublicOutletAddressDto;
  businessHours?: PublicOutletBusinessHoursDto;
  delivery?: PublicOutletDeliveryDto;
  support?: PublicOutletSupportDto;
  gstNumber?: string;
  fssaiNumber?: string;
  googleMapsUrl?: string;
}

export class PublicOutletMapper {
  static toDto(
    bundle: OutletPublicBundle,
    distanceKm?: number,
  ): PublicOutletDto {
    const { outlet, profile, extras } = bundle;
    const location = outlet.location?.getRaw();
    const radiusKm = outlet.deliveryRadiusKm ?? 5;

    const displayName =
      extras.displayName?.trim() ||
      [outlet.name, outlet.branch].filter(Boolean).join(' ').trim();

    const base: PublicOutletDto = {
      id: outlet.id,
      name: outlet.name,
      branch: outlet.branch,
      status: outlet.status,
      workingState: { status: outlet.workingState.getRaw() },
      location: location ?? { latitude: 0, longitude: 0 },
      deliveryRadiusKm: radiusKm,
      isCentral: outlet.isCentral,
      ...(distanceKm !== undefined ? { distanceKm } : {}),
    };

    const address = this.buildAddress(outlet, extras);
    const businessHours = this.buildBusinessHours(extras);
    const delivery = this.buildDelivery(radiusKm, extras);
    const support = this.buildSupport(profile, extras);

    return {
      ...base,
      ...(displayName ? { displayName } : {}),
      ...(extras.code?.trim() ? { code: extras.code.trim() } : {}),
      ...(profile?.contactEmail?.trim()
        ? { email: profile.contactEmail.trim() }
        : {}),
      ...(profile?.contactPhone?.trim()
        ? { phone: profile.contactPhone.trim() }
        : {}),
      ...(extras.alternatePhone?.trim()
        ? { alternatePhone: extras.alternatePhone.trim() }
        : {}),
      ...(address ? { address } : {}),
      ...(businessHours ? { businessHours } : {}),
      ...(delivery ? { delivery } : {}),
      ...(support ? { support } : {}),
      ...(profile?.gstNumber?.trim()
        ? { gstNumber: profile.gstNumber.trim() }
        : {}),
      ...(profile?.fssaiNumber?.trim()
        ? { fssaiNumber: profile.fssaiNumber.trim() }
        : {}),
      ...(extras.googleMapsUrl?.trim()
        ? { googleMapsUrl: extras.googleMapsUrl.trim() }
        : {}),
    };
  }

  static toDtoList(
    bundles: OutletPublicBundleWithDistance[],
  ): PublicOutletDto[] {
    return bundles.map((item) =>
      this.toDto(
        {
          outlet: item.outlet,
          profile: item.profile,
          extras: item.extras,
        },
        item.distanceKm,
      ),
    );
  }

  private static buildAddress(
    outlet: Outlet,
    extras: OutletPublicExtras,
  ): PublicOutletAddressDto | undefined {
    const line1 = outlet.address?.trim();
    const line2 = extras.addressLine2?.trim();
    const landmark = extras.landmark?.trim();
    const area = extras.area?.trim();
    const city = extras.city?.trim();
    const state = extras.state?.trim();
    const country = extras.country?.trim();
    const postalCode = outlet.pincode?.trim();
    const formattedAddress =
      extras.formattedAddress?.trim() ||
      extras.locationText?.trim() ||
      line1;

    if (
      !line1 &&
      !line2 &&
      !landmark &&
      !area &&
      !city &&
      !state &&
      !country &&
      !postalCode &&
      !formattedAddress
    ) {
      return undefined;
    }

    return {
      ...(line1 ? { line1 } : {}),
      ...(line2 ? { line2 } : {}),
      ...(landmark ? { landmark } : {}),
      ...(area ? { area } : {}),
      ...(city ? { city } : {}),
      ...(state ? { state } : {}),
      ...(country ? { country } : {}),
      ...(postalCode ? { postalCode } : {}),
      ...(formattedAddress ? { formattedAddress } : {}),
    };
  }

  private static buildBusinessHours(
    extras: OutletPublicExtras,
  ): PublicOutletBusinessHoursDto | undefined {
    const openingTime = extras.openingTime?.trim();
    const closingTime = extras.closingTime?.trim();
    if (!openingTime && !closingTime) return undefined;
    return {
      ...(openingTime ? { openingTime } : {}),
      ...(closingTime ? { closingTime } : {}),
    };
  }

  private static buildDelivery(
    radiusKm: number,
    extras: OutletPublicExtras,
  ): PublicOutletDeliveryDto {
    return {
      radiusKm,
      ...(extras.estimatedDeliveryMinutes != null &&
      extras.estimatedDeliveryMinutes > 0
        ? { estimatedMinutes: extras.estimatedDeliveryMinutes }
        : {}),
    };
  }

  private static buildSupport(
    profile: OutletProfile | null,
    extras: OutletPublicExtras,
  ): PublicOutletSupportDto | undefined {
    const phone = profile?.contactPhone?.trim();
    const email = profile?.contactEmail?.trim();
    const whatsapp = extras.supportWhatsapp?.trim();

    if (!phone && !email && !whatsapp) return undefined;

    return {
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      ...(whatsapp ? { whatsapp } : {}),
    };
  }
}
