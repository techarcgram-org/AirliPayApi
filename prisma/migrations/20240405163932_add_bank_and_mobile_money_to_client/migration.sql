-- CreateTable
CREATE TABLE "client_banks" (
    "id" BIGSERIAL NOT NULL,
    "account_number" VARCHAR,
    "client_id" BIGINT NOT NULL,
    "bank_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "client_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_mobile_money_accounts" (
    "id" BIGSERIAL NOT NULL,
    "phone_number" VARCHAR,
    "operator" "operators",
    "client_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "default" BOOLEAN,

    CONSTRAINT "client_mobile_money_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "index_client_banks_on_bank_id" ON "client_banks"("bank_id");

-- CreateIndex
CREATE INDEX "index_client_banks_on_client_id" ON "client_banks"("client_id");

-- CreateIndex
CREATE INDEX "index_client_mobile_money_accounts_on_client_id" ON "client_mobile_money_accounts"("client_id");

-- AddForeignKey
ALTER TABLE "client_banks" ADD CONSTRAINT "fk_rails_8489a23145" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client_banks" ADD CONSTRAINT "fk_rails_9e84f78ddd" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "client_mobile_money_accounts" ADD CONSTRAINT "fk_rails_f3b530c4f3" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
