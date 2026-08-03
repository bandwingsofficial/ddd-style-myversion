import { PrismaClient } from '@prisma/client';

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

const TEST_LOCATIONS = [
  { name: 'Malleshwaram GPS', lat: 13.005459, lng: 77.569199 },
  { name: 'Yelahanka search', lat: 13.100691, lng: 77.596348 },
  { name: 'Rajajinagar search', lat: 13.010904, lng: 77.554776 },
  { name: 'Hebbal search', lat: 13.035769, lng: 77.597022 },
];

const prisma = new PrismaClient();
const outlets = await prisma.outlet.findMany({
  where: { latitude: { not: null }, status: 'ACTIVE', workingStatus: 'OPEN' },
});

console.log('=== Outlet resolution simulation ===\n');

for (const loc of TEST_LOCATIONS) {
  const matches = outlets
    .map((o) => {
      const distanceKm = haversineKm(loc.lat, loc.lng, o.latitude, o.longitude);
      const radius = o.deliveryRadiusKm ?? 5;
      return {
        outlet: o.name,
        distanceKm: Number(distanceKm.toFixed(2)),
        radius,
        serviceable: distanceKm <= radius,
      };
    })
    .filter((m) => m.serviceable)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  console.log(`${loc.name} (${loc.lat}, ${loc.lng})`);
  console.log(
    matches.length
      ? `  → ${matches.map((m) => `${m.outlet} (${m.distanceKm} km)`).join(', ')}`
      : '  → NO OUTLET (expected if no outlet in radius)',
  );
  console.log('');
}

await prisma.$disconnect();
