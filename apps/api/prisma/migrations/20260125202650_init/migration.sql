-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'INTERVIEW', 'OFFERED', 'REJECTED');

-- CreateTable
CREATE TABLE "Users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interviews" (
    "id" TEXT NOT NULL,
    "notes" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationInterviews" (
    "applicationId" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,

    CONSTRAINT "ApplicationInterviews_pkey" PRIMARY KEY ("applicationId","interviewId")
);

-- CreateTable
CREATE TABLE "UserApplications" (
    "userId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "UserApplications_pkey" PRIMARY KEY ("userId","applicationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE INDEX "Applications_status_idx" ON "Applications"("status");

-- CreateIndex
CREATE INDEX "Applications_createdAt_idx" ON "Applications"("createdAt");

-- CreateIndex
CREATE INDEX "Interviews_scheduledAt_idx" ON "Interviews"("scheduledAt");

-- AddForeignKey
ALTER TABLE "ApplicationInterviews" ADD CONSTRAINT "ApplicationInterviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationInterviews" ADD CONSTRAINT "ApplicationInterviews_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserApplications" ADD CONSTRAINT "UserApplications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserApplications" ADD CONSTRAINT "UserApplications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
