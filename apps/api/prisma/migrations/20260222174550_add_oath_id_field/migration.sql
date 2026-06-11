
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "oauth_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_oauth_id_key" ON "users"("oauth_id");
