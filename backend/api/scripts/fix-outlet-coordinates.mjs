import { PrismaClient } from '@prisma/client';

const CORRECTIONS = [
  {
    name: 'Yelahanka',
    latitude: 13.100691,
    longitude: 77.596348,
    reason: 'Corrected longitude typo (76.x → 77.x) for Yelahanka New Town address',
  },
];

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const prisma = new PrismaClient();

for (const fix of CORRECTIONS) {
  const outlet = await prisma.outlet.findFirst({
    where: { name: fix.name },
  });

  if (!outlet) {
    console.log(`SKIP: outlet "${fix.name}" not found`);
    continue;
  }

  const before = { lat: outlet.latitude, lng: outlet.longitude };
  await prisma.outlet.update({
    where: { id: outlet.id },
    data: {
      latitude: fix.latitude,
      longitude: fix.longitude,
    },
  });

  console.log(
    JSON.stringify({
      event: 'outlet_coordinate_corrected',
      outletId: outlet.id,
      name: fix.name,
      before,
      after: { lat: fix.latitude, lng: fix.longitude },
      reason: fix.reason,
    }),
  );
}

const outlets = await prisma.outlet.findMany({
  where: { latitude: { not: null } },
  select: {
    id: true,
    name: true,
    latitude: true,
    longitude: true,
    deliveryRadiusKm: true,
    workingStatus: true,
  },
});

console.log('\n--- Outlet validation ---');
for (const o of outlets) {
  const issues = [];
  const lat = o.latitude;
  const lng = o.longitude;

  if (lat < -90 || lat > 90) issues.push('INVALID_LAT');
  if (lng < -180 || lng > 180) issues.push('INVALID_LNG');
  if (lat >= 12.5 && lat <= 14 && lng >= 76 && lng < 77) {
    issues.push('SUSPICIOUS_LNG_76_BAND');
  }

  console.log(JSON.stringify({ ...o, issues }));
}

const malleshwaram = outlets.find((o) => o.name === 'Malleshwaram');
const yelahanka = outlets.find((o) => o.name === 'Yelahanka');
if (malleshwaram?.latitude && yelahanka?.latitude) {
  const dist = haversineKm(
    malleshwaram.latitude,
    malleshwaram.longitude,
    yelahanka.latitude,
    yelahanka.longitude,
  );
  console.log(
    JSON.stringify({
      event: 'inter_outlet_distance_check',
      from: 'Malleshwaram',
      to: 'Yelahanka',
      distanceKm: Number(dist.toFixed(2)),
    }),
  );
}

await prisma.$disconnect();
