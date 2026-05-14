-- CreateTable
CREATE TABLE "towers" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalFloors" INTEGER NOT NULL,
    "totalFlats" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "towers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "towers_societyId_idx" ON "towers"("societyId");

-- CreateIndex
CREATE UNIQUE INDEX "towers_societyId_name_key" ON "towers"("societyId", "name");

-- AddForeignKey
ALTER TABLE "towers" ADD CONSTRAINT "towers_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
