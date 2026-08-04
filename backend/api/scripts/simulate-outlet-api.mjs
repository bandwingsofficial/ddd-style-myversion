/**
 * Simulate full API path for each outlet + check outlet user bindings.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REPO_WHERE = (outletId) => ({
  outletId,
  status: { notIn: ['CREATED', 'PAYMENT_PENDING'] },
});

async function simulateOutletOrders(outletId, outletName) {
  const all = await prisma.order.findMany({
    where: { outletId },
    select: { id: true, orderNumber: true, status: true },
  });

  const repo = await prisma.order.findMany({
    where: REPO_WHERE(outletId),
    orderBy: { createdAt: 'desc' },
    select: { id: true, orderNumber: true, status: true },
  });

  console.log(`\n--- ${outletName} (${outletId}) ---`);
  console.log('Prisma all orders:', all.length, all.map((o) => o.orderNumber));
  console.log('Repository findByOutlet:', repo.length, repo.map((o) => `${o.orderNumber}:${o.status}`));
  return repo;
}

async function main() {
  const outlets = await prisma.outlet.findMany({
    select: { id: true, name: true },
  });

  for (const o of outlets) {
    await simulateOutletOrders(o.id, o.name);
  }

  console.log('\n=== OutletUser bindings ===');
  const users = await prisma.outletUser.findMany({
    select: {
      id: true,
      email: true,
      phone: true,
      outletId: true,
      isActive: true,
      outlet: { select: { name: true } },
    },
  });
  console.table(
    users.map((u) => ({
      email: u.email,
      phone: u.phone,
      outlet: u.outlet.name,
      outletId: u.outletId,
      isActive: u.isActive,
    })),
  );

  // Check if any order has Yelahanka outletId but wrong outlet name join
  console.log('\n=== Orders with outletId = Yelahanka but verify join ===');
  const yId = outlets.find((o) => o.name === 'Yelahanka')?.id;
  if (yId) {
    const crossCheck = await prisma.order.findMany({
      where: { outletId: yId },
      include: { outlet: { select: { name: true } } },
    });
    console.log('Count:', crossCheck.length);
  }

  // Malleshwaram orders - what History would show
  const malId = outlets.find((o) => o.name === 'Malleshwaram')?.id;
  if (malId) {
    const malRepo = await prisma.order.findMany({
      where: REPO_WHERE(malId),
      select: { orderNumber: true, status: true },
    });
    console.log('\n=== Malleshwaram API would return (for History allOrders):', malRepo.length, 'orders');
    console.table(malRepo);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
