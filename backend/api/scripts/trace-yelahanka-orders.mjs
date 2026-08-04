/**
 * Trace outlet orders for Yelahanka: Prisma → repository filter → API-shaped output.
 * Run: node scripts/trace-yelahanka-orders.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const outlet = await prisma.outlet.findFirst({
    where: { name: 'Yelahanka' },
    select: { id: true, name: true },
  });

  if (!outlet) {
    console.log('STEP 1: Yelahanka outlet NOT FOUND in database');
    return;
  }

  console.log('=== STEP 1: Prisma — all orders for Yelahanka ===');
  console.log('outletId:', outlet.id);
  console.log('outletName:', outlet.name);

  const allOrders = await prisma.order.findMany({
    where: { outletId: outlet.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      outletId: true,
      customerId: true,
      createdAt: true,
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { status: true },
      },
    },
  });

  console.log('Total rows (no status filter):', allOrders.length);
  console.table(
    allOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.payments[0]?.status ?? 'NONE',
      createdAt: o.createdAt.toISOString(),
      outletId: o.outletId,
      customerId: o.customerId,
    })),
  );

  console.log('\n=== STEP 2: Repository findByOutlet() equivalent ===');
  const where = {
    outletId: outlet.id,
    status: { notIn: ['CREATED', 'PAYMENT_PENDING'] },
  };
  console.log('Prisma WHERE:', JSON.stringify(where, null, 2));

  const repoOrders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      createdAt: true,
    },
  });

  console.log('Returned row count:', repoOrders.length);
  console.log('Returned order IDs:', repoOrders.map((o) => o.id));
  console.table(repoOrders);

  const excluded = allOrders.filter(
    (o) => o.status === 'CREATED' || o.status === 'PAYMENT_PENDING',
  );
  if (excluded.length > 0) {
    console.log('\n⚠ Orders EXCLUDED by repository status filter:');
    console.table(
      excluded.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.payments[0]?.status ?? 'NONE',
      })),
    );
  }

  console.log('\n=== STEP 3: Outlet users for Yelahanka ===');
  const outletUsers = await prisma.outletUser.findMany({
    where: { outletId: outlet.id },
    select: {
      id: true,
      email: true,
      isActive: true,
      outletId: true,
    },
  });
  console.table(outletUsers);

  console.log('\n=== Status breakdown (all orders) ===');
  const byStatus = allOrders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log(byStatus);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
