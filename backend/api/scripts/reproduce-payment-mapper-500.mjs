/**
 * Reproduce payment mapper failure on GET /outlet-orders.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

  const orderIds = orders.map((o) => o.id);
  console.log('Order IDs:', orderIds.length);

  const payments = await prisma.payment.findMany({
    where: { orderId: { in: orderIds } },
    orderBy: { createdAt: 'desc' },
  });

  const latestByOrder = new Map();
  for (const p of payments) {
    if (!latestByOrder.has(p.orderId)) {
      latestByOrder.set(p.orderId, p);
    }
  }

  console.log('\nLatest payment per order:');
  for (const [orderId, payment] of latestByOrder) {
    const order = orders.find((o) => o.id === orderId);
    console.log(
      `${order?.orderNumber}: payment status = ${payment.status}`,
    );
    if (payment.status === 'EXPIRED') {
      console.log('  >>> PaymentMapper.toDomain would THROW: Unknown Prisma PaymentStatus: EXPIRED');
    }
  }

  const expired = payments.filter((p) => p.status === 'EXPIRED');
  console.log('\nTotal EXPIRED payments:', expired.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
