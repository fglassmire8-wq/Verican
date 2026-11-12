-- AlterTable
ALTER TABLE "User" ADD COLUMN "disabled" BOOLEAN NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PublishLock" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "reviewId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
