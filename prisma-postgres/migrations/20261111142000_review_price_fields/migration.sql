-- AlterTable
ALTER TABLE "Review" ADD COLUMN "priceIncludesTax" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Review" ADD COLUMN "pricePerGramCents" INTEGER;
