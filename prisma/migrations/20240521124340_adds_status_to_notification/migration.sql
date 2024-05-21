/*
  Warnings:

  - Added the required column `status` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "status" BOOLEAN NOT NULL;
