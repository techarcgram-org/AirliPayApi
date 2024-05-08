/*
  Warnings:

  - You are about to drop the column `address_id` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `mobile_money_number` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `secondery_phone` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `account_status` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `bank_account_number` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `account_status` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `activation_date` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `available_balance` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `back_account_number` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `date_of_birth` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `savings_balance` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `total_withdrawals` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `savings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `savings_withdrawals` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `withdrawals` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `account_type` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address_id` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address_id` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "transaction_types" AS ENUM ('WITHDRAW', 'DEPOSIT');

-- CreateEnum
CREATE TYPE "withdrawal_status" AS ENUM ('SUCCESS', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "operators" AS ENUM ('ORANGE', 'MTN', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "account_status_types" AS ENUM ('DEACTIVATED', 'ACTIVE', 'PENDING', 'BLOCKED', 'BANNED');

-- CreateEnum
CREATE TYPE "account_types" AS ENUM ('ADMIN', 'CLIENT', 'USER');

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "fk_rails_198f25c0c3";

-- DropForeignKey
ALTER TABLE "savings" DROP CONSTRAINT "fk_rails_0a2c60972c";

-- DropForeignKey
ALTER TABLE "savings_withdrawals" DROP CONSTRAINT "fk_rails_ad7d9d4797";

-- DropForeignKey
ALTER TABLE "withdrawals" DROP CONSTRAINT "fk_rails_75e44d8e7b";

-- DropIndex
DROP INDEX "index_accounts_on_address_id";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "address_id",
ADD COLUMN     "access_token" VARCHAR,
ADD COLUMN     "account_status" "account_status_types" DEFAULT 'PENDING',
ADD COLUMN     "account_type" "account_types" NOT NULL,
ADD COLUMN     "activation_date" DATE,
ADD COLUMN     "confirm_secret" VARCHAR,
ADD COLUMN     "current_sign_in_at" TIMESTAMP(6),
ADD COLUMN     "current_sign_in_ip" VARCHAR,
ADD COLUMN     "email_confirmation_sent_at" TIMESTAMP(6),
ADD COLUMN     "email_confirmed" BOOLEAN,
ADD COLUMN     "failed_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_sign_in_at" TIMESTAMP(6),
ADD COLUMN     "last_sign_in_ip" VARCHAR,
ADD COLUMN     "locked_at" TIMESTAMP(6),
ADD COLUMN     "phone_confirmation_sent_at" TIMESTAMP(6),
ADD COLUMN     "phone_confirmed" BOOLEAN,
ADD COLUMN     "refresh_token" VARCHAR,
ADD COLUMN     "sign_in_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unlock_token" VARCHAR,
ADD COLUMN     "username" VARCHAR;

-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "mobile_money_number",
DROP COLUMN "phone_number",
DROP COLUMN "secondery_phone",
ADD COLUMN     "primary_phone_number" VARCHAR,
ADD COLUMN     "secondery_phone_number" VARCHAR;

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "address_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "account_status",
DROP COLUMN "bank_account_number",
ADD COLUMN     "address_id" BIGINT NOT NULL,
ALTER COLUMN "industry" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "account_status",
DROP COLUMN "activation_date",
DROP COLUMN "available_balance",
DROP COLUMN "back_account_number",
DROP COLUMN "date_of_birth",
DROP COLUMN "savings_balance",
DROP COLUMN "total_withdrawals",
ADD COLUMN     "address_id" BIGINT NOT NULL,
ADD COLUMN     "dob" DATE,
ADD COLUMN     "photo" VARCHAR,
ADD COLUMN     "sex" VARCHAR;

-- DropTable
DROP TABLE "savings";

-- DropTable
DROP TABLE "savings_withdrawals";

-- DropTable
DROP TABLE "withdrawals";

-- CreateTable
CREATE TABLE "banks" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR,
    "is_partner" BOOLEAN,
    "supports_api" BOOLEAN,
    "swift" VARCHAR,
    "address_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_banks" (
    "id" BIGSERIAL NOT NULL,
    "account_number" VARCHAR,
    "user_id" BIGINT NOT NULL,
    "bank_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "user_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_settings" (
    "id" BIGSERIAL NOT NULL,
    "language" VARCHAR,
    "security_pin" VARCHAR,
    "notification_enabled" BOOLEAN,
    "pin_enabled" BOOLEAN,
    "two_fa_enabled" BOOLEAN,
    "default_bank_id" BIGINT,
    "default_momo_account_id" BIGINT,
    "user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "account_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_mobile_money_accounts" (
    "id" BIGSERIAL NOT NULL,
    "phone_number" VARCHAR,
    "operator" "operators",
    "user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "default" BOOLEAN,

    CONSTRAINT "user_mobile_money_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airlipay_balances" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "balance" DOUBLE PRECISION,
    "early_transaction_id" BIGINT,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "airlipay_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_balances" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "balance" DOUBLE PRECISION,
    "savings_transaction_id" BIGINT,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "savings_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_transactions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "status" "withdrawal_status",
    "transaction_type" "transaction_types" DEFAULT 'WITHDRAW',
    "initiated_date" TIMESTAMP(6),
    "execution_date" TIMESTAMP(6),
    "amount" DOUBLE PRECISION,
    "fees" DOUBLE PRECISION,
    "new_balance" DOUBLE PRECISION,
    "old_balance" DOUBLE PRECISION,
    "operator" "operators",
    "phone_number" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "savings_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "early_transactions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "status" "withdrawal_status",
    "transaction_type" "transaction_types" DEFAULT 'WITHDRAW',
    "initiated_date" TIMESTAMP(6),
    "execution_date" TIMESTAMP(6),
    "amount" DOUBLE PRECISION,
    "fees" DOUBLE PRECISION,
    "new_balance" DOUBLE PRECISION,
    "old_balance" DOUBLE PRECISION,
    "operator" "operators",
    "phone_number" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "early_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "index_banks_on_address_id" ON "banks"("address_id");

-- CreateIndex
CREATE INDEX "index_user_banks_on_bank_id" ON "user_banks"("bank_id");

-- CreateIndex
CREATE INDEX "index_user_banks_on_user_id" ON "user_banks"("user_id");

-- CreateIndex
CREATE INDEX "index_account_settings_on_default_bank_id" ON "account_settings"("default_bank_id");

-- CreateIndex
CREATE INDEX "index_account_settings_on_user_id" ON "account_settings"("user_id");

-- CreateIndex
CREATE INDEX "index_account_settings_on_default_momo_account_id" ON "account_settings"("default_momo_account_id");

-- CreateIndex
CREATE INDEX "index_user_mobile_money_accounts_on_user_id" ON "user_mobile_money_accounts"("user_id");

-- CreateIndex
CREATE INDEX "index_airlipay_balances_on_user_id" ON "airlipay_balances"("user_id");

-- CreateIndex
CREATE INDEX "index_airlipay_balances_on_early_transaction_id" ON "airlipay_balances"("early_transaction_id");

-- CreateIndex
CREATE INDEX "index_savings_balances_on_savings_transaction_id" ON "savings_balances"("savings_transaction_id");

-- CreateIndex
CREATE INDEX "index_savings_balances_on_user_id" ON "savings_balances"("user_id");

-- CreateIndex
CREATE INDEX "index_savings_transactions_on_user_id" ON "savings_transactions"("user_id");

-- CreateIndex
CREATE INDEX "index_early_transactions_on_user_id" ON "early_transactions"("user_id");

-- CreateIndex
CREATE INDEX "index_admins_on_address_id" ON "admins"("address_id");

-- CreateIndex
CREATE INDEX "index_clients_on_address_id" ON "clients"("address_id");

-- CreateIndex
CREATE INDEX "index_users_on_address_id" ON "users"("address_id");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "fk_rails_c8120b7a66" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "fk_rails_56e36fce15" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_rails_eb2fc738e4" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "banks" ADD CONSTRAINT "fk_rails_310a58ada9" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_banks" ADD CONSTRAINT "fk_rails_8489a27145" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_banks" ADD CONSTRAINT "fk_rails_9e84f48ddd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "account_settings" ADD CONSTRAINT "fk_rails_68404ac0af" FOREIGN KEY ("default_bank_id") REFERENCES "user_banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "account_settings" ADD CONSTRAINT "fk_rails_9a762b5dd2" FOREIGN KEY ("default_momo_account_id") REFERENCES "user_mobile_money_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "account_settings" ADD CONSTRAINT "fk_rails_e382d4202a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_mobile_money_accounts" ADD CONSTRAINT "fk_rails_f3b530b4f3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "airlipay_balances" ADD CONSTRAINT "fk_rails_67ce807e38" FOREIGN KEY ("early_transaction_id") REFERENCES "early_transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "airlipay_balances" ADD CONSTRAINT "fk_rails_af9cfa2627" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "savings_balances" ADD CONSTRAINT "fk_rails_03bca7691a" FOREIGN KEY ("savings_transaction_id") REFERENCES "savings_transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "savings_balances" ADD CONSTRAINT "fk_rails_acccd5babc" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "savings_transactions" ADD CONSTRAINT "fk_rails_6b026816cc" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "early_transactions" ADD CONSTRAINT "fk_rails_08c702b977" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
