-- Split Distributor.name into nameAr/nameEn.
-- Existing rows keep their single name in both columns; the English spellings
-- are written afterwards by prisma/translate-distributor-names.ts.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Distributor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cityAr" TEXT NOT NULL,
    "cityEn" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "mapUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Distributor" ("id", "nameAr", "nameEn", "phone", "cityAr", "cityEn", "region", "lat", "lng", "mapUrl", "isActive", "sortOrder", "createdAt", "updatedAt")
SELECT "id", "name", "name", "phone", "cityAr", "cityEn", "region", "lat", "lng", "mapUrl", "isActive", "sortOrder", "createdAt", "updatedAt" FROM "Distributor";

DROP TABLE "Distributor";
ALTER TABLE "new_Distributor" RENAME TO "Distributor";
CREATE INDEX "Distributor_isActive_region_sortOrder_idx" ON "Distributor"("isActive", "region", "sortOrder");

PRAGMA foreign_keys=ON;
