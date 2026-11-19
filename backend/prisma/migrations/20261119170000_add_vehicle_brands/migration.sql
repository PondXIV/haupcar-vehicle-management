CREATE TABLE "vehicle_brands" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_brands_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vehicle_brands_name_key" ON "vehicle_brands"("name");
