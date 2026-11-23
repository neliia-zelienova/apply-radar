-- Interview reminders were removed from the apps.
-- AlterTable
ALTER TABLE "interviews" DROP COLUMN "notify_enabled",
DROP COLUMN "notify_minutes_before";
