/*
  Warnings:

  - The `agenda` column on the `meetings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[meetingId,userId,resolutionId]` on the table `meeting_votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `meeting_votes` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `vote` on the `meeting_votes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `meetingType` to the `meetings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('AGM', 'SGM', 'COMMITTEE', 'EMERGENCY', 'TOWER', 'GENERAL');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VoteOption" AS ENUM ('YES', 'NO', 'ABSTAIN');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'PROXY');

-- CreateEnum
CREATE TYPE "ResolutionType" AS ENUM ('FINANCIAL', 'ELECTION', 'BYLAW', 'MAINTENANCE', 'EMERGENCY', 'OTHER');

-- CreateEnum
CREATE TYPE "VotingMethod" AS ENUM ('SIMPLE_MAJORITY', 'TWO_THIRDS', 'UNANIMOUS');

-- CreateEnum
CREATE TYPE "ResolutionStatus" AS ENUM ('PENDING', 'PASSED', 'REJECTED');

-- DropIndex
DROP INDEX "meeting_votes_meetingId_userId_key";

-- AlterTable
ALTER TABLE "meeting_votes" ADD COLUMN     "flatId" TEXT,
ADD COLUMN     "isProxyVote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "proxyHolderName" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "resolutionId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "votingWeight" DECIMAL(65,30) NOT NULL DEFAULT 1,
DROP COLUMN "vote",
ADD COLUMN     "vote" "VoteOption" NOT NULL;

-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "allowProxyVotes" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "attachmentUrls" JSONB,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "isAnonymousVoting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVotingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "meetingLink" TEXT,
ADD COLUMN     "meetingNotes" TEXT,
ADD COLUMN     "meetingType" "MeetingType" NOT NULL,
ADD COLUMN     "minutesDocumentUrl" TEXT,
ADD COLUMN     "quorumPercentage" INTEGER NOT NULL DEFAULT 51,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "totalEligibleVoters" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalVotesCast" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "votingEndsAt" TIMESTAMP(3),
ADD COLUMN     "votingStartsAt" TIMESTAMP(3),
DROP COLUMN "agenda",
ADD COLUMN     "agenda" JSONB;

-- CreateTable
CREATE TABLE "meeting_attendances" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flatId" TEXT,
    "attendanceStatus" "AttendanceStatus" NOT NULL,
    "checkInAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_resolutions" (
    "id" TEXT NOT NULL,
    "societyId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resolutionType" "ResolutionType" NOT NULL,
    "votingMethod" "VotingMethod" NOT NULL DEFAULT 'SIMPLE_MAJORITY',
    "status" "ResolutionStatus" NOT NULL DEFAULT 'PENDING',
    "passedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meeting_attendances_societyId_meetingId_idx" ON "meeting_attendances"("societyId", "meetingId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_attendances_meetingId_userId_key" ON "meeting_attendances"("meetingId", "userId");

-- CreateIndex
CREATE INDEX "meeting_resolutions_societyId_meetingId_idx" ON "meeting_resolutions"("societyId", "meetingId");

-- CreateIndex
CREATE INDEX "meeting_votes_resolutionId_idx" ON "meeting_votes"("resolutionId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_votes_meetingId_userId_resolutionId_key" ON "meeting_votes"("meetingId", "userId", "resolutionId");

-- CreateIndex
CREATE INDEX "meetings_societyId_status_idx" ON "meetings"("societyId", "status");

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_votes" ADD CONSTRAINT "meeting_votes_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_votes" ADD CONSTRAINT "meeting_votes_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "meeting_resolutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendances" ADD CONSTRAINT "meeting_attendances_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendances" ADD CONSTRAINT "meeting_attendances_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendances" ADD CONSTRAINT "meeting_attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendances" ADD CONSTRAINT "meeting_attendances_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_resolutions" ADD CONSTRAINT "meeting_resolutions_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_resolutions" ADD CONSTRAINT "meeting_resolutions_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
