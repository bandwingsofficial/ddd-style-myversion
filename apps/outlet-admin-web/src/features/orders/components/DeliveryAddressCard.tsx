'use client';

import { MapPin, Navigation } from 'lucide-react';
import { CustomerAddress } from '../types';
import {
  hasDeliveryCoordinates,
  openGoogleMapsDirections,
} from '../utils/delivery-location.util';

interface DeliveryAddressCardProps {
  address?: CustomerAddress | null;
  compact?: boolean;
  className?: string;
}

export function DeliveryAddressCard({
  address,
  compact = false,
  className = '',
}: DeliveryAddressCardProps) {
  if (!address) {
    return (
      <p className={`text-xs text-gray-400 italic ${className}`}>
        No address provided
      </p>
    );
  }

  const hasStructuredFields =
    address.houseNumber ||
    address.street ||
    address.landmark ||
    address.pincode;

  const canNavigate = hasDeliveryCoordinates(address);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">
        <MapPin size={14} className="text-emerald-500 shrink-0" />
        <span>Delivery Address</span>
      </div>

      <div className={`space-y-0.5 ${compact ? 'text-[11px]' : 'text-xs'} text-gray-700`}>
        {address.label ? (
          <p className="font-semibold text-gray-900">{address.label}</p>
        ) : null}

        {hasStructuredFields ? (
          <>
            {address.houseNumber ? <p>{address.houseNumber}</p> : null}
            {address.street ? <p>{address.street}</p> : null}
            {address.landmark ? <p>{address.landmark}</p> : null}
            {address.pincode ? <p>{address.pincode}</p> : null}
          </>
        ) : address.addressText ? (
          <p className="leading-relaxed text-gray-600">{address.addressText}</p>
        ) : null}
      </div>

      {canNavigate ? (
        <button
          type="button"
          onClick={() =>
            openGoogleMapsDirections(address.latitude, address.longitude)
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
        >
          <Navigation size={12} />
          Get Directions
        </button>
      ) : (
        <p className="text-[11px] font-medium text-gray-400">Location unavailable</p>
      )}
    </div>
  );
}
