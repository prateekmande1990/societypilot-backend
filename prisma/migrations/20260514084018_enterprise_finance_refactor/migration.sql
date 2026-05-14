/*
  Warnings:

  - You are about to drop the column `amount` on the `bills` table. All the data in the column will be lost.
  - The `status` column on the `bills` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[billNumber]` on the table `bills` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[receiptNumber]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `billNumber` to the `bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueAmount` to the `bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiptNumber` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `method` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'WAIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'CHEQUE');

-- CreateEnum
CREATE TYPE "ChargeHeadType" AS ENUM ('MAINTENANCE', 'WATER', 'SINKING_FUND', 'PARKING', 'CLUBHOUSE', 'PENALTY', 'SPECIAL_ASSESSMENT', 'OTHER');

-- AlterTable
ALTER TABLE "bills" DROP COLUMN "amount",
ADD COLUMN     "billNumber" TEXT NOT NULL,
ADD COLUMN     "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "dueAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "penaltyAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BillStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "receiptNumber" TEXT NOT NULL,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "transactionReference" TEXT,
DROP COLUMN "method",
ADD COLUMN     "method" "PaymentMethod" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'SUCCESS';

-- CreateTable
CREATE TABLE "charge_heads" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "ChargeHeadType" NOT NULL,
    "description" TEXT,
    "defaultAmount" DECIMAL(10,2) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charge_heads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_line_items" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "chargeHeadId" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitAmount" DECIMAL(10,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bill_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "charge_heads_societyId_isActive_idx" ON "charge_heads"("societyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "charge_heads_societyId_code_key" ON "charge_heads"("societyId", "code");

-- CreateIndex
CREATE INDEX "bill_line_items_billId_idx" ON "bill_line_items"("billId");

-- CreateIndex
CREATE INDEX "bill_line_items_chargeHeadId_idx" ON "bill_line_items"("chargeHeadId");

-- CreateIndex
CREATE UNIQUE INDEX "bills_billNumber_key" ON "bills"("billNumber");

-- CreateIndex
CREATE INDEX "bills_societyId_status_idx" ON "bills"("societyId", "status");

-- CreateIndex
CREATE INDEX "bills_billNumber_idx" ON "bills"("billNumber");

-- CreateIndex
CREATE UNIQUE INDEX "payments_receiptNumber_key" ON "payments"("receiptNumber");

-- CreateIndex
CREATE INDEX "payments_societyId_status_idx" ON "payments"("societyId", "status");

-- CreateIndex
CREATE INDEX "payments_receiptNumber_idx" ON "payments"("receiptNumber");

-- AddForeignKey
ALTER TABLE "charge_heads" ADD CONSTRAINT "charge_heads_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_line_items" ADD CONSTRAINT "bill_line_items_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_line_items" ADD CONSTRAINT "bill_line_items_chargeHeadId_fkey" FOREIGN KEY ("chargeHeadId") REFERENCES "charge_heads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
