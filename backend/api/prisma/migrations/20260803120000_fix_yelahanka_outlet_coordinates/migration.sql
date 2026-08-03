-- Fix Yelahanka outlet longitude typo (76.5725 → 77.596348)
-- Was causing ~100 km false distance from Bangalore locations.

UPDATE "Outlet"
SET
  latitude = 13.100691,
  longitude = 77.596348,
  "updatedAt" = NOW()
WHERE name = 'Yelahanka'
  AND longitude BETWEEN 76 AND 77;
