import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecurringTransactionOverrides1793370700192 implements MigrationInterface {
    name = 'AddRecurringTransactionOverrides1793370700192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "recurring_transaction_overrides" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recurring_transaction_id" uuid NOT NULL, "month" integer NOT NULL, "year" integer NOT NULL, "amount" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_recurring_override_month" UNIQUE ("recurring_transaction_id", "year", "month"), CONSTRAINT "PK_recurring_transaction_overrides" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "recurring_transaction_overrides" ADD CONSTRAINT "FK_recurring_override_rule" FOREIGN KEY ("recurring_transaction_id") REFERENCES "recurring_transactions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recurring_transaction_overrides" DROP CONSTRAINT "FK_recurring_override_rule"`);
        await queryRunner.query(`DROP TABLE "recurring_transaction_overrides"`);
    }

}
