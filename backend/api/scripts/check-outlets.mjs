import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const outlets = await prisma.outlet.findMany({
  where: { latitude: { not: null } },
  select: {
    id: true,
    name: true,
    branch: true,
    latitude: true,
    longitude: true,
    deliveryRadiusKm: true,
    status: true,
    workingStatus: true,
    address: true,
  },
  orderBy: { name: 'asc' },
});

for (const o of outlets) {
  const lat = o.latitude;
  const lng = o.longitude;
  const issues = [];
  if (lat < -90 || lat > 90) issues.push('INVALID_LAT');
  if (lng < -180 || lng > 180) issues.push('INVALID_LNG');
  // Bangalore service area sanity: lat 12-14, lng 77-78
  if (lat < 8 || lat > 37) issues.push('LAT_OUTSIDE_INDIA');
  if (lng < 68 || lng > 97) issues.push('LNG_OUTSIDE_INDIA');
  if (lat > 20 && lng < 20) issues.push('LIKELY_LAT_LNG_SWAPPED');
  if (lng > 20 && lat > 20 && (lat > 15 || lng < 70)) issues.push('SUSPICIOUS_COORDS');

  console.log(JSON.stringify({ ...o, issues }));
}

await prisma.$disconnect();
