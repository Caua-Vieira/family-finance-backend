import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHouseholdInviteCode1787620808619 implements MigrationInterface {
    name = 'AddHouseholdInviteCode1787620808619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "households" ADD "invite_code" character varying`);
        await queryRunner.query(`UPDATE "households" SET "invite_code" = substr(replace(uuid_generate_v4()::text, '-', ''), 1, 6) WHERE "invite_code" IS NULL`);
        await queryRunner.query(`ALTER TABLE "households" ALTER COLUMN "invite_code" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "households" ADD CONSTRAINT "UQ_households_invite_code" UNIQUE ("invite_code")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "households" DROP CONSTRAINT "UQ_households_invite_code"`);
        await queryRunner.query(`ALTER TABLE "households" DROP COLUMN "invite_code"`);
    }

}
