import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvestmentTransactionType1793500000000 implements MigrationInterface {
    name = 'AddInvestmentTransactionType1793500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."transactions_type_enum" ADD VALUE IF NOT EXISTS 'investment'`);
        await queryRunner.query(`ALTER TYPE "public"."recurring_transactions_type_enum" ADD VALUE IF NOT EXISTS 'investment'`);
    }

    public async down(): Promise<void> {
        // Postgres não remove valores de enum; reverter exigiria recriar o tipo.
        // O valor 'investment' pode ficar sem uso sem efeitos colaterais.
    }

}
