import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvestmentYieldFields1792030318015 implements MigrationInterface {
    name = 'AddInvestmentYieldFields1792030318015'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "investments" ADD "reference_date" date`);
        await queryRunner.query(`ALTER TABLE "investments" ADD "indexer" character varying`);
        await queryRunner.query(`ALTER TABLE "investments" ADD "rate" numeric(8,4)`);
        await queryRunner.query(`ALTER TABLE "investments" ADD "monthly_contribution" numeric(14,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "investments" ADD "contribution_day" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "investments" DROP COLUMN "contribution_day"`);
        await queryRunner.query(`ALTER TABLE "investments" DROP COLUMN "monthly_contribution"`);
        await queryRunner.query(`ALTER TABLE "investments" DROP COLUMN "rate"`);
        await queryRunner.query(`ALTER TABLE "investments" DROP COLUMN "indexer"`);
        await queryRunner.query(`ALTER TABLE "investments" DROP COLUMN "reference_date"`);
    }

}
