import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleAuth1793240299206 implements MigrationInterface {
    name = 'AddGoogleAuth1793240299206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Contas criadas pelo Google não têm senha até o usuário definir uma pela recuperação.
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "google_id" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_users_google_id" UNIQUE ("google_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_users_google_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL`);
    }

}
