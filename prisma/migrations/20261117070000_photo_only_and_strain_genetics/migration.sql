-- Redefine Review so storeId is optional and add photoOnly.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeId" TEXT,
    "amount" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "priceIncludesTax" BOOLEAN NOT NULL DEFAULT 0,
    "pricePerGramCents" INTEGER,
    "notes" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "harvestDate" TEXT,
    "expDate" TEXT,
    "thcPercent" REAL,
    "thcaPercent" REAL,
    "topTerpene" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER,
    "photoOnly" BOOLEAN NOT NULL DEFAULT 0,
    CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Review" (
    "id", "productId", "userId", "storeId", "amount", "priceCents", "currency",
    "priceIncludesTax", "pricePerGramCents", "notes", "verdict", "harvestDate",
    "expDate", "thcPercent", "thcaPercent", "topTerpene", "status", "createdAt",
    "rating", "photoOnly"
)
SELECT
    "id", "productId", "userId", "storeId", "amount", "priceCents", "currency",
    "priceIncludesTax", "pricePerGramCents", "notes", "verdict", "harvestDate",
    "expDate", "thcPercent", "thcaPercent", "topTerpene", "status", "createdAt",
    "rating", 0
FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Strain genetics archive
CREATE TABLE "StrainGenetics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "lineage" TEXT NOT NULL,
    "sourceReviewId" TEXT,
    "updatedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StrainGenetics_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "StrainGenetics_key_key" ON "StrainGenetics"("key");

CREATE TABLE "StrainGeneticsHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "geneticsId" TEXT NOT NULL,
    "lineage" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "sourceReviewId" TEXT,
    "addedById" TEXT,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StrainGeneticsHistory_geneticsId_fkey" FOREIGN KEY ("geneticsId") REFERENCES "StrainGenetics" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StrainGeneticsHistory_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "StrainGeneticsHistory_geneticsId_idx" ON "StrainGeneticsHistory"("geneticsId");
