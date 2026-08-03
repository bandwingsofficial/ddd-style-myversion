const PAYMENT_SESSION_KEY = "canten_payment_session";
const VERIFIED_PREFIX = "canten_payment_verified_";

export interface PaymentSession {
  orderId: string;
  orderNumber: string;
  paymentId: string;
  addressId?: string;
  amount?: string;
  startedAt: number;
}

export function savePaymentSession(session: PaymentSession): void {
  try {
    sessionStorage.setItem(PAYMENT_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore quota errors
  }
}

export function getPaymentSession(): PaymentSession | null {
  try {
    const raw = sessionStorage.getItem(PAYMENT_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PaymentSession;
  } catch {
    return null;
  }
}

export function clearPaymentSession(): void {
  try {
    sessionStorage.removeItem(PAYMENT_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function markPaymentVerified(orderId: string): void {
  try {
    sessionStorage.setItem(`${VERIFIED_PREFIX}${orderId}`, "1");
  } catch {
    // ignore
  }
}

export function isPaymentVerified(orderId: string): boolean {
  try {
    return sessionStorage.getItem(`${VERIFIED_PREFIX}${orderId}`) === "1";
  } catch {
    return false;
  }
}
