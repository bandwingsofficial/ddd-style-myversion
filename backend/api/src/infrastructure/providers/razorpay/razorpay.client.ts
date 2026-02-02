import Razorpay from 'razorpay';
import crypto from 'crypto';

/* ================================================= */
/* RAZORPAY RAW CLIENT (SDK WRAPPER ONLY)            */
/* NO business logic                                 */
/* NO prisma                                         */
/* NO domain                                         */
/* ================================================= */

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

if (!keyId || !keySecret) {
  throw new Error(
    'Razorpay keys missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET',
  );
}

/* ================================================= */
/* SDK INSTANCE                                      */
/* ================================================= */

export const razorpayClient = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

/* ================================================= */
/* LOW LEVEL HELPERS                                 */
/* Used by PaymentGatewayService only                */
/* ================================================= */

/**
 * Create Razorpay Order (NOT your DB order)
 * Razorpay requires amount in paisa (₹ * 100)
 */
export async function createRazorpayOrder(params: {
  receipt: string;
  amount: number; // rupees
  currency: string;
}) {
  return razorpayClient.orders.create({
  receipt: params.receipt,
  amount: Math.round(params.amount * 100),
  currency: params.currency,
  payment_capture: true,
});
}

/**
 * Fetch payment details from Razorpay
 */
export async function fetchRazorpayPayment(paymentId: string) {
  return razorpayClient.payments.fetch(paymentId);
}

/**
 * Verify webhook signature (HMAC SHA256)
 */
export function verifyRazorpaySignature(params: {
  payload: string | Buffer;
  signature?: string;
}) {
  if (!webhookSecret) return;

  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(params.payload)
    .digest('hex');

  if (expected !== params.signature) {
    throw new Error('Invalid Razorpay webhook signature');
  }
}
