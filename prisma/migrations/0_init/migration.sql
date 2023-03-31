-- CreateTable
CREATE TABLE "accounts" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR NOT NULL DEFAULT '',
    "encrypted_password" VARCHAR NOT NULL DEFAULT '',
    "reset_password_token" VARCHAR,
    "reset_password_sent_at" TIMESTAMP(6),
    "remember_created_at" TIMESTAMP(6),
    "user_id" BIGINT NOT NULL,
    "admin_id" BIGINT NOT NULL,
    "client_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" BIGSERIAL NOT NULL,
    "phone_number" VARCHAR,
    "city" VARCHAR,
    "region" VARCHAR,
    "mobile_money_number" VARCHAR,
    "street" VARCHAR,
    "secondery_phone" VARCHAR,
    "account_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR,
    "role" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ar_internal_metadata" (
    "key" VARCHAR NOT NULL,
    "value" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ar_internal_metadata_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "client_payments" (
    "id" BIGSERIAL NOT NULL,
    "status" INTEGER,
    "client_id" BIGINT NOT NULL,
    "amount" DECIMAL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "client_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR,
    "industry" INTEGER,
    "tax_id" VARCHAR,
    "bank_account_number" VARCHAR,
    "account_status" INTEGER,
    "client_commision" INTEGER,
    "earning_report_status" BOOLEAN,
    "next_payment_date" DATE,
    "employee_roaster_file" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "amount" DECIMAL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "savings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_withdrawals" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "amount" DECIMAL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "savings_withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schema_migrations" (
    "version" VARCHAR NOT NULL,

    CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR,
    "base_salary" DECIMAL,
    "account_status" INTEGER,
    "total_withdrawals" DECIMAL,
    "employee_id" VARCHAR,
    "date_of_birth" DATE,
    "back_account_number" VARCHAR,
    "available_balance" DECIMAL,
    "next_payment_date" DATE,
    "activation_date" DATE,
    "received_earlypay" BOOLEAN,
    "savings_balance" DECIMAL,
    "client_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawals" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "amount" DECIMAL,
    "charges" DECIMAL,
    "status" INTEGER,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "index_accounts_on_email" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "index_accounts_on_reset_password_token" ON "accounts"("reset_password_token");

-- CreateIndex
CREATE INDEX "index_accounts_on_admin_id" ON "accounts"("admin_id");

-- CreateIndex
CREATE INDEX "index_accounts_on_client_id" ON "accounts"("client_id");

-- CreateIndex
CREATE INDEX "index_accounts_on_user_id" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "index_addresses_on_account_id" ON "addresses"("account_id");

-- CreateIndex
CREATE INDEX "index_client_payments_on_client_id" ON "client_payments"("client_id");

-- CreateIndex
CREATE INDEX "index_savings_on_user_id" ON "savings"("user_id");

-- CreateIndex
CREATE INDEX "index_savings_withdrawals_on_user_id" ON "savings_withdrawals"("user_id");

-- CreateIndex
CREATE INDEX "index_users_on_client_id" ON "users"("client_id");

-- CreateIndex
CREATE INDEX "index_withdrawals_on_user_id" ON "withdrawals"("user_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "fk_rails_65d703860a" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "fk_rails_93f6feb1b9" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "fk_rails_b1e30bebc8" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "fk_rails_ecb8c3ff41" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client_payments" ADD CONSTRAINT "fk_rails_e4adce2942" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "savings" ADD CONSTRAINT "fk_rails_0a2c60972c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "savings_withdrawals" ADD CONSTRAINT "fk_rails_ad7d9d4797" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_rails_d3559eaf4c" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "fk_rails_75e44d8e7b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

