import customerAxios from "@/http/axios/customerAxios";
import type { Address } from "@/features/addresses/address.types";
import { invalidateProductCatalogCache } from "@/features/products/api/product.api";
import { useLocationStore } from "@/features/location/location.store";
import { useOutletStore } from "@/features/outlet/outlet.store";
import type { Outlet } from "@/features/outlet/outlet.type";
import { traceOutletBinding } from "@/features/checkout/resolve-checkout-outlet.util";

/**
 * Applies a saved address as the delivery location WITHOUT re-resolving outlet
 * from coordinates. Uses the address's pre-computed resolvedOutletId as truth.
 */
export async function applySavedAddressOutlet(address: Address): Promise<void> {
  if (!address.resolvedOutletId) {
    throw new Error("Address has no resolved outlet");
  }

  useLocationStore.getState().setDeliveryAddress({
    lat: address.latitude,
    lng: address.longitude,
    label: address.label || address.addressText,
    formattedAddress: address.addressText,
    source: "saved",
  });

  const res = await customerAxios.get<{ data: Outlet }>(
    `/public/outlets/${address.resolvedOutletId}`,
  );

  const outlet = res.data.data;
  if (!outlet?.id) {
    throw new Error("Resolved outlet not found");
  }

  useOutletStore.getState().setOutlet({
    ...outlet,
    distanceKm: outlet.distanceKm ?? 0,
  });

  invalidateProductCatalogCache();

  traceOutletBinding({
    stage: "location.applySavedAddressOutlet",
    selectedOutletId: outlet.id,
    resolvedOutletId: address.resolvedOutletId,
  });
}
