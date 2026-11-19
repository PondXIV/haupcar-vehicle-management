ALTER TABLE "auth_users" DROP CONSTRAINT "auth_users_pkey";

ALTER TABLE "auth_users"
ADD COLUMN "id" BIGSERIAL NOT NULL;

ALTER TABLE "auth_users"
ADD CONSTRAINT "auth_users_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "auth_users_username_key" ON "auth_users"("username");
