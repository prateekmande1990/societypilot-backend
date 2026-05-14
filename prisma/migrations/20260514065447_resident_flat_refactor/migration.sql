/*
  Warnings:

  - You are about to drop the column `flatId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `towerId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_flatId_fkey";

-- DropIndex
DROP INDEX "users_flatId_idx";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "flatId",
DROP COLUMN "towerId";

-- CreateTable
CREATE TABLE "resident_flats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flatId" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "moveInDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moveOutDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resident_flats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resident_flats_userId_idx" ON "resident_flats"("userId");

-- CreateIndex
CREATE INDEX "resident_flats_flatId_idx" ON "resident_flats"("flatId");

-- CreateIndex
CREATE INDEX "resident_flats_societyId_idx" ON "resident_flats"("societyId");

-- AddForeignKey
ALTER TABLE "resident_flats" ADD CONSTRAINT "resident_flats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident_flats" ADD CONSTRAINT "resident_flats_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident_flats" ADD CONSTRAINT "resident_flats_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
