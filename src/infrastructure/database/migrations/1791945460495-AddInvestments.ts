import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvestments1791945460495 implements MigrationInterface {
    name = 'AddInvestments1791945460495'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "investments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "household_id" uuid NOT NULL, "name" character varying NOT NULL, "type" character varying NOT NULL, "institution" character varying, "invested_amount" numeric(14,2) NOT NULL, "current_value" numeric(14,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_investments_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "investments" ADD CONSTRAINT "FK_investments_household" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "investments" DROP CONSTRAINT "FK_investments_household"`);
        await queryRunner.query(`DROP TABLE "investments"`);
    }

}
