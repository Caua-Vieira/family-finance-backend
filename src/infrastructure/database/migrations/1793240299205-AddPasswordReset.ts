import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordReset1793240299205 implements MigrationInterface {
    name = 'AddPasswordReset1793240299205'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password_reset_token_hash" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password_reset_expires_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_reset_expires_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_reset_token_hash"`);
    }

}
