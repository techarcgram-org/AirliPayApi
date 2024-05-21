/*
  Warnings:

  - Changed the type of `status` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "notification_status" AS ENUM ('SUCCESS', 'PENDING', 'FAILED');

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "status",
ADD COLUMN     "status" "notification_status" NOT NULL;
