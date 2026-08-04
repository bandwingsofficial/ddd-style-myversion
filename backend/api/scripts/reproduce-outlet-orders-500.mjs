/**
 * Reproduce GET /outlet-orders path through repository → mapper → DTO.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const outlet = await prisma.outlet.findFirst({
    where: { name: 'Malleshwaram' },
  });
  if (!outlet) {
    console.log('No Malleshwaram outlet');
    return;
  }

  const outletId = outlet.id;
  console.log('outletId:', outletId);

  const rows = await prisma.order.findMany({
    where: {
      outletId,
      status: { notIn: ['CREATED', 'PAYMENT_PENDING'] },
    },
    include: {
      items: true,
      customer: { include: { profile: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('Prisma row count:', rows.length);

  for (const row of rows) {
    console.log(`\n--- Order ${row.orderNumber} (${row.id}) ---`);
    console.log('items count:', row.items?.length ?? 0);
    if (!row.items || row.items.length === 0) {
      console.log('>>> WOULD THROW in OrderMapper.toDomain');
    }
  }

  // Check orders with empty items across all outlets
  const emptyItemOrders = await prisma.order.findMany({
    where: {
      status: { notIn: ['CREATED', 'PAYMENT_PENDING'] },
    },
    include: { items: true, outlet: { select: { name: true } } },
  });

  const noItems = emptyItemOrders.filter((o) => !o.items || o.items.length === 0);
  if (noItems.length) {
    console.log('\n=== Orders with ZERO items (would 500) ===');
    console.table(
      noItems.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        outlet: o.outlet.name,
        itemCount: o.itemCount,
      })),
    );
  } else {
    console.log('\nNo visible orders with zero items.');
  }

  // Check itemCount mismatch
  for (const row of rows) {
    if (row.itemCount !== row.items.length) {
      console.log(
        `Mismatch: ${row.orderNumber} itemCount=${row.itemCount} actual items=${row.items.length}`,
      );
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
