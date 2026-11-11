-- AlterTable
ALTER TABLE "Review" ADD COLUMN "rating" INTEGER;

-- CreateTable
CREATE TABLE "ReviewRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReviewRating_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ReviewRating_reviewId_idx" ON "ReviewRating"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewRating_reviewId_visitorId_key" ON "ReviewRating"("reviewId", "visitorId");
