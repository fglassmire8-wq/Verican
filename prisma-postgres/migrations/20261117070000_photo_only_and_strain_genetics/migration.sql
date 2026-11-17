ALTER TABLE "Review" ALTER COLUMN "storeId" DROP NOT NULL;
ALTER TABLE "Review" ADD COLUMN "photoOnly" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "StrainGenetics" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "lineage" TEXT NOT NULL,
    "sourceReviewId" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StrainGenetics_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StrainGenetics_key_key" ON "StrainGenetics"("key");
ALTER TABLE "StrainGenetics" ADD CONSTRAINT "StrainGenetics_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "StrainGeneticsHistory" (
    "id" TEXT NOT NULL,
    "geneticsId" TEXT NOT NULL,
    "lineage" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "sourceReviewId" TEXT,
    "addedById" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StrainGeneticsHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StrainGeneticsHistory_geneticsId_idx" ON "StrainGeneticsHistory"("geneticsId");
ALTER TABLE "StrainGeneticsHistory" ADD CONSTRAINT "StrainGeneticsHistory_geneticsId_fkey" FOREIGN KEY ("geneticsId") REFERENCES "StrainGenetics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StrainGeneticsHistory" ADD CONSTRAINT "StrainGeneticsHistory_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
