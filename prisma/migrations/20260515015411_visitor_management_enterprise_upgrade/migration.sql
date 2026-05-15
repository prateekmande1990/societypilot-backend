/*
  Warnings:

  - The `status` column on the `visitor_pre_approvals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `visitors` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `visitorType` to the `visitor_pre_approvals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visitorType` to the `visitors` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VisitorType" AS ENUM ('GUEST', 'DELIVERY', 'CAB', 'SERVICE', 'STAFF', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'ENTERED', 'EXITED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ApprovalMode" AS ENUM ('PRE_APPROVED', 'CALL_APPROVED', 'OTP_APPROVED', 'QR_APPROVED', 'MANUAL');

-- AlterTable
ALTER TABLE "visitor_pre_approvals" ADD COLUMN     "flatId" TEXT,
ADD COLUMN     "maxEntries" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "usedEntries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vehicleNo" TEXT,
ADD COLUMN     "visitorType" "VisitorType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "VisitorStatus" NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "visitors" ADD COLUMN     "approvalMode" "ApprovalMode",
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "deniedAt" TIMESTAMP(3),
ADD COLUMN     "entryGate" TEXT,
ADD COLUMN     "exitGate" TEXT,
ADD COLUMN     "isInside" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "preApprovalId" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "residentId" TEXT,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "visitorType" "VisitorType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "VisitorStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "entryAt" DROP NOT NULL,
ALTER COLUMN "entryAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "visitor_pre_approvals_societyId_status_idx" ON "visitor_pre_approvals"("societyId", "status");

-- CreateIndex
CREATE INDEX "visitor_pre_approvals_societyId_validUntil_idx" ON "visitor_pre_approvals"("societyId", "validUntil");

-- CreateIndex
CREATE INDEX "visitors_societyId_status_idx" ON "visitors"("societyId", "status");

-- CreateIndex
CREATE INDEX "visitors_societyId_visitorType_idx" ON "visitors"("societyId", "visitorType");

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_preApprovalId_fkey" FOREIGN KEY ("preApprovalId") REFERENCES "visitor_pre_approvals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_pre_approvals" ADD CONSTRAINT "visitor_pre_approvals_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
