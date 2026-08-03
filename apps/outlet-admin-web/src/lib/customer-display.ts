export interface CustomerContactInput {
  id?: string | null;
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface OrderCustomer {
  id: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
}

export interface CustomerDisplayInfo extends OrderCustomer {
  displayName: string;
  showPhoneLine: boolean;
}

export const GUEST_CUSTOMER_LABEL = 'Guest Customer';

function trimOrNull(value?: string | null): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Single source of truth for customer display fallback across outlet admin. */
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

export function resolveOrderCustomer(order: {
  customer?: OrderCustomer | null;
  customerId?: string;
  customerFullName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
}): CustomerDisplayInfo {
  if (order.customer) {
    return getCustomerDisplayInfo(order.customer);
  }

  return getCustomerDisplayInfo({
    id: order.customerId,
    fullName: order.customerFullName,
    phone: order.customerPhone,
    email: order.customerEmail,
  });
}

export function customerMatchesSearch(
  input: CustomerContactInput,
  searchTerm: string,
): boolean {
  const term = searchTerm.trim().toLowerCase();
  if (!term) return true;

  const info = getCustomerDisplayInfo(input);
  return [info.fullName, info.phone, info.email, info.displayName]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(term));
}
