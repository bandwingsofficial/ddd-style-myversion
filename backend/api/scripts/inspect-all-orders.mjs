/**
 * Broader DB inspection for outlet orders trace.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== All outlets ===');
  const outlets = await prisma.outlet.findMany({
    select: { id: true, name: true, isActive: true },
    orderBy: { name: 'asc' },
  });
  console.table(outlets);

  console.log('\n=== Recent orders (last 30) ===');
  const recent = await prisma.order.findMany({
    take: 30,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      outletId: true,
      createdAt: true,
      outlet: { select: { name: true } },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { status: true },
      },
    },
  });
  console.log('Total recent:', recent.length);
  console.table(
    recent.map((o) => ({
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.payments[0]?.status ?? 'NONE',
      outlet: o.outlet.name,
      outletId: o.outletId,
      createdAt: o.createdAt.toISOString(),
    })),
  );

  console.log('\n=== Order count by outlet ===');
  const counts = await prisma.order.groupBy({
    by: ['outletId'],
    _count: { id: true },
  });
  for (const c of counts) {
    const outlet = outlets.find((o) => o.id === c.outletId);
    console.log(`${outlet?.name ?? c.outletId}: ${c._count.id}`);
  }

  console.log('\n=== Total orders in DB ===');
  const total = await prisma.order.count();
  console.log(total);

  // Fuzzy search Yelahanka
  const yelahankaLike = await prisma.outlet.findMany({
    where: { name: { contains: 'Yelah', mode: 'insensitive' } },
  });
  console.log('\n=== Outlets matching Yelah* ===');
  console.table(yelahankaLike);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
