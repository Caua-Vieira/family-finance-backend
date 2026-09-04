import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatementEntries1788319240758 implements MigrationInterface {
    name = 'AddStatementEntries1788319240758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "statement_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "household_id" uuid NOT NULL, "card_id" integer NOT NULL, "category_id" integer, "description" character varying NOT NULL, "amount" numeric(10,2) NOT NULL, "date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ae8ae259282b22ef81326a98824" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "statement_entries" ADD CONSTRAINT "FK_94ca1d0fae586382ca51edba81d" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "statement_entries" ADD CONSTRAINT "FK_f592c2357f35cf0466d9207ca64" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "statement_entries" ADD CONSTRAINT "FK_7c98c424970ed4304200df47af5" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "statement_entries" DROP CONSTRAINT "FK_7c98c424970ed4304200df47af5"`);
        await queryRunner.query(`ALTER TABLE "statement_entries" DROP CONSTRAINT "FK_f592c2357f35cf0466d9207ca64"`);
        await queryRunner.query(`ALTER TABLE "statement_entries" DROP CONSTRAINT "FK_94ca1d0fae586382ca51edba81d"`);
        await queryRunner.query(`DROP TABLE "statement_entries"`);
    }

}
