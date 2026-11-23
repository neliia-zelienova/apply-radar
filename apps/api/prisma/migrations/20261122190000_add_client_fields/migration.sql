-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "position" TEXT NOT NULL DEFAULT '';
-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "location_link" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "notify_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_minutes_before" INTEGER;
