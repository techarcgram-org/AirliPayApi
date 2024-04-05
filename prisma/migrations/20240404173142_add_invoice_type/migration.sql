/*
  Warnings:

  - The values [SUCCESS,PENDING,FAILED] on the enum `invoice_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "invoice_status_new" AS ENUM ('TREATED', 'NOT_TREATED');
ALTER TABLE "invoices" ALTER COLUMN "status" TYPE "invoice_status_new" USING ("status"::text::"invoice_status_new");
ALTER TYPE "invoice_status" RENAME TO "invoice_status_old";
ALTER TYPE "invoice_status_new" RENAME TO "invoice_status";
DROP TYPE "invoice_status_old";
COMMIT;
