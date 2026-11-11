-- AlterTable
ALTER TABLE "Review" ADD COLUMN "priceIncludesTax" BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE "Review" ADD COLUMN "pricePerGramCents" INTEGER;
