/*
  Warnings:

  - You are about to drop the column `flatType` on the `flats` table. All the data in the column will be lost.
  - You are about to drop the column `tower` on the `flats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[towerId,flatNumber]` on the table `flats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `towerId` to the `flats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `flats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "flats" DROP CONSTRAINT "flats_societyId_fkey";

-- DropIndex
DROP INDEX "flats_societyId_flatNumber_tower_key";

-- AlterTable
ALTER TABLE "document_requests" ADD COLUMN     "flatId" TEXT;

-- AlterTable
ALTER TABLE "flats" DROP COLUMN "flatType",
DROP COLUMN "tower",
ADD COLUMN     "areaSqFt" DOUBLE PRECISION,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "occupancyStatus" TEXT NOT NULL DEFAULT 'VACANT',
ADD COLUMN     "towerId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "flatId" TEXT;

-- AlterTable
ALTER TABLE "visitors" ADD COLUMN     "flatId" TEXT;

-- CreateIndex
CREATE INDEX "flats_societyId_idx" ON "flats"("societyId");

-- CreateIndex
CREATE INDEX "flats_towerId_idx" ON "flats"("towerId");

-- CreateIndex
CREATE UNIQUE INDEX "flats_towerId_flatNumber_key" ON "flats"("towerId", "flatNumber");

-- AddForeignKey
ALTER TABLE "flats" ADD CONSTRAINT "flats_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flats" ADD CONSTRAINT "flats_towerId_fkey" FOREIGN KEY ("towerId") REFERENCES "towers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
