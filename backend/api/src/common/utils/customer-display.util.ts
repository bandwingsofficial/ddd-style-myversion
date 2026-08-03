export interface CustomerContactInput {
  id?: string | null;
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface OrderCustomerDto {
  id: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
}

export interface CustomerDisplayInfo extends OrderCustomerDto {
  /** Primary label: fullName → phone → email → Guest Customer */
  displayName: string;
  /** Show a separate phone line when name exists and phone is available */
  showPhoneLine: boolean;
}

export const GUEST_CUSTOMER_LABEL = 'Guest Customer';

function trimOrNull(value?: string | null): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Single source of truth for customer display fallback across the order pipeline. */
export function getCustomerDisplayInfo(
  input: CustomerContactInput,
): CustomerDisplayInfo {
  const fullName = trimOrNull(input.fullName);
  const phone = trimOrNull(input.phone);
  const email = trimOrNull(input.email);
  const id = trimOrNull(input.id) ?? '';

  let displayName = GUEST_CUSTOMER_LABEL;
  if (fullName) {
    displayName = fullName;
  } else if (phone) {
    displayName = phone;
  } else if (email) {
    displayName = email;
  }

  return {
    id,
    fullName,
    phone,
    email,
    displayName,
    showPhoneLine: Boolean(fullName && phone),
  };
}

export function mapOrderCustomerDto(
  input: CustomerContactInput,
): OrderCustomerDto & { displayName: string; showPhoneLine: boolean } {
  const info = getCustomerDisplayInfo(input);
  return {
    id: info.id,
    fullName: info.fullName,
    phone: info.phone,
    email: info.email,
    displayName: info.displayName,
    showPhoneLine: info.showPhoneLine,
  };
}

export function customerMatchesSearch(
  input: CustomerContactInput,
  searchTerm: string,
): boolean {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return true;

  const info = getCustomerDisplayInfo(input);
  const haystack = [
    info.fullName,
    info.phone,
    info.email,
    info.displayName,
  ]
    .filter(Boolean)
    .map((value) => value!.toLowerCase());

  return haystack.some((value) => value.includes(term));
}
