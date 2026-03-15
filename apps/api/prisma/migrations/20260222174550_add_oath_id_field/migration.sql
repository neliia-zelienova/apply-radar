ALTER TABLE "users" ADD COLUMN     "oauth_id" TEXT;
-- CreateIndex
CREATE UNIQUE INDEX "users_oauth_id_key" ON "users"("oauth_id") WHERE "oauth_id" IS NOT NULL;