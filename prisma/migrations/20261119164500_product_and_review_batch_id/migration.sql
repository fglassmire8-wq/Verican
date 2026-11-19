-- AlterTable
ALTER TABLE "Product" ADD COLUMN "batchId" TEXT;
ALTER TABLE "Review" ADD COLUMN "batchId" TEXT;

-- CreateIndex
CREATE INDEX "Product_batchId_idx" ON "Product"("batchId");
