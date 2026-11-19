CREATE TYPE "vehicle_type" AS ENUM ('Electric', 'Gasoline', 'Hybrid');

CREATE TABLE "vehicles" (
    "id" BIGSERIAL NOT NULL,
    "license_plate" VARCHAR(20) NOT NULL,
    "brand_id" BIGINT NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "vehicle_type" "vehicle_type" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "vehicles_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "vehicle_brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "vehicles_license_plate_key" ON "vehicles"("license_plate");
CREATE INDEX "vehicles_brand_id_idx" ON "vehicles"("brand_id");
