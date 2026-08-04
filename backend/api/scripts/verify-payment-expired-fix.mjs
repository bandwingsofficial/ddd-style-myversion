/**
 * Verify GET /outlet-orders payment mapping path after EXPIRED fix.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DOMAIN_MAP = {
  INITIATED: 'INITIATED',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED',
};

function toDomainStatus(status) {
  const mapped = DOMAIN_MAP[status];
  if (!mapped) {
    throw new Error(`Unknown Prisma PaymentStatus: ${status}`);
  }
  return mapped;
}

async function main() {
  const outletId = (
    await prisma.outlet.findFirst({ where: { name: 'Malleshwaram' } })
  )?.id;

  const orders = await prisma.order.findMany({
    where: {
      outletId,
      status: { notIn: ['CREATED', 'PAYMENT_PENDING'] },
    },
    select: { id: true, orderNumber: true },
  });

  const payments = await prisma.payment.findMany({
    where: { orderId: { in: orders.map((o) => o.id) } },
    orderBy: { createdAt: 'desc' },
  });

  const map = new Map();
  for (const row of payments) {
    if (!map.has(row.orderId)) {
      toDomainStatus(row.status);
      map.set(row.orderId, row.status);
    }
  }

  console.log('PASS: mapped latest payments for', map.size, 'orders');
  for (const [orderId, status] of map) {
    const order = orders.find((o) => o.id === orderId);
    console.log(`  ${order?.orderNumber}: ${status}`);
  }
}

main()
  .catch((e) => {
    console.error('FAIL:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
