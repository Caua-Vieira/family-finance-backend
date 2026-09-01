import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecurringTransactions1787887010942 implements MigrationInterface {
    name = 'AddRecurringTransactions1787887010942'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."recurring_transactions_type_enum" AS ENUM('income', 'expense')`);
        await queryRunner.query(`CREATE TABLE "recurring_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "household_id" uuid NOT NULL, "type" "public"."recurring_transactions_type_enum" NOT NULL, "amount" numeric(10,2) NOT NULL, "description" character varying NOT NULL, "category_id" integer, "card_id" integer, "user_id" uuid, "day_of_month" integer NOT NULL, "start_date" date NOT NULL, "end_date" date, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6485db3243762a54992dc0ce3b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD "recurring_transaction_id" uuid`);
        await queryRunner.query(`ALTER TABLE "recurring_transactions" ADD CONSTRAINT "FK_48dc92424d53c43c44a72335dc3" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recurring_transactions" ADD CONSTRAINT "FK_eb623e5e626cf95fd42710adf25" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recurring_transactions" ADD CONSTRAINT "FK_e515a82c8f9cacdd55cd774b26f" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recurring_transactions" ADD CONSTRAINT "FK_d78f3002f99b0f15a3797201c92" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_50371499043ce644481531ce059" FOREIGN KEY ("recurring_transaction_id") REFERENCES "recurring_transactions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_50371499043ce644481531ce059"`);
        await queryRunner.query(`ALTER TABLE "recurring_transactions" DROP CONSTRAINT "FK_d78f3002f99b0f15a3797201c92"`);
        await queryRunner.query(`ALTER TABLE "recurring_transactions" DROP CONSTRAINT "FK_e515a82c8f9cacdd55cd774b26f"`);
        await queryRunner.query(`ALTER TABLE "recurring_transactions" DROP CONSTRAINT "FK_eb623e5e626cf95fd42710adf25"`);
        await queryRunner.query(`ALTER TABLE "recurring_transactions" DROP CONSTRAINT "FK_48dc92424d53c43c44a72335dc3"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "recurring_transaction_id"`);
        await queryRunner.query(`DROP TABLE "recurring_transactions"`);
        await queryRunner.query(`DROP TYPE "public"."recurring_transactions_type_enum"`);
    }

}
