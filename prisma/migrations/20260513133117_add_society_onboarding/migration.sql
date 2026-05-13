-- AlterTable
ALTER TABLE "societies" ALTER COLUMN "status" SET DEFAULT 'PENDING_SETUP';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isOnboardingDone" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "society_onboarding" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "chairmanCreated" BOOLEAN NOT NULL DEFAULT false,
    "towersConfigured" BOOLEAN NOT NULL DEFAULT false,
    "flatsImported" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceConfigured" BOOLEAN NOT NULL DEFAULT false,
    "paymentGatewayConfigured" BOOLEAN NOT NULL DEFAULT false,
    "completedPercentage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "society_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "society_onboarding_societyId_key" ON "society_onboarding"("societyId");

-- CreateIndex
CREATE INDEX "societies_city_idx" ON "societies"("city");

-- CreateIndex
CREATE INDEX "societies_state_idx" ON "societies"("state");

-- CreateIndex
CREATE INDEX "societies_status_idx" ON "societies"("status");

-- AddForeignKey
ALTER TABLE "society_onboarding" ADD CONSTRAINT "society_onboarding_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
