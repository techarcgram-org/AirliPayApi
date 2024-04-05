-- CreateEnum
CREATE TYPE "invoice_status" AS ENUM ('SUCCESS', 'PENDING', 'FAILED');

-- AlterEnum
ALTER TYPE "account_types" ADD VALUE 'SUPER_ADMIN';

-- CreateTable
CREATE TABLE "invoices" (
    "id" BIGSERIAL NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "client_id" BIGINT NOT NULL,
    "status" "invoice_status" NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "totalFees" DECIMAL(10,2) NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "taxes" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invoices_client_id_idx" ON "invoices"("client_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- RenameForeignKey
ALTER TABLE "early_transactions" RENAME CONSTRAINT "fk_rails_08c702b977" TO "fk_rails_08c702b97";

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "fk_rails_08c702b978" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
