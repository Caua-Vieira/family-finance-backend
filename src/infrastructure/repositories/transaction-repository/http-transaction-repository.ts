import { Inject } from "typescript-ioc";
import { TransactionRepository } from "../../../domain/contracts/transaction-repository";
import { DatabaseException, NotFoundException } from "../../../domain/errors/errors";
import { Transaction } from "../../entities/transactions";
import { Database } from "../../database/database";
import { TransactionDTO } from "../../../domain/types/transaction-dto";
import { TransactionFiltersDTO } from "../../../domain/types/transaction-filters-dto";

export class HttpTransactionRepository implements TransactionRepository {
    constructor(@Inject private database: Database) { }

    async create(data: TransactionDTO): Promise<void> {
        try {
            const repository = this.database.getRepository(Transaction);
            const transaction = repository.create(data);
            await repository.save(transaction);
        } catch (error) {
            throw new DatabaseException("Ocorreu um erro ao registrar a transação");
        }
    }

    async createMany(data: TransactionDTO[]): Promise<void> {
        try {
            const repository = this.database.getRepository(Transaction);
            const transactions = repository.create(data);
            await repository.save(transactions);
        } catch (error) {
            throw new DatabaseException("Ocorreu um erro ao importar as transações");
        }
    }

    async findByHouseholdId(householdId: string, filters: TransactionFiltersDTO): Promise<Transaction[]> {
        try {
            const repository = this.database.getRepository(Transaction);
            const query = repository.createQueryBuilder("transaction")
                .where("transaction.householdId = :householdId", { householdId });

            this.buildFilterConditions(filters).forEach(({ clause, params }) => query.andWhere(clause, params));

            query.orderBy("transaction.date", "DESC");

            return await query.getMany();
        } catch (error) {
            throw new DatabaseException("Ocorreu um erro ao buscar as transações");
        }
    }

    async findGeneratedRecurringIds(periodStart: Date, periodEnd: Date): Promise<string[]> {
        try {
            const rows = await this.database.getRepository(Transaction)
                .createQueryBuilder("transaction")
                .select("DISTINCT transaction.recurringTransactionId", "recurringTransactionId")
                .where("transaction.recurringTransactionId IS NOT NULL")
                .andWhere("transaction.date >= :periodStart", { periodStart })
                .andWhere("transaction.date <= :periodEnd", { periodEnd })
                .getRawMany<{ recurringTransactionId: string }>();

            return rows.map((row) => row.recurringTransactionId);
        } catch (error) {
            throw new DatabaseException("Ocorreu um erro ao buscar os lançamentos recorrentes já gerados");
        }
    }

    async update(data: TransactionDTO): Promise<void> {
        const { id, householdId, ...rest } = data;

        let result;
        try {
            result = await this.database.getRepository(Transaction).update({ id, householdId }, rest);
        } catch {
            throw new DatabaseException("Ocorreu um erro ao atualizar a transação");
        }

        if (!result.affected) {
            throw new NotFoundException("Transação não encontrada");
        }
    }

    async delete(id: string, householdId: string): Promise<void> {
        let result;
        try {
            result = await this.database.getRepository(Transaction).delete({ id, householdId });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao excluir a transação");
        }

        if (!result.affected) {
            throw new NotFoundException("Transação não encontrada");
        }
    }

    private buildFilterConditions(filters: TransactionFiltersDTO): { clause: string; params: Record<string, unknown> }[] {
        const conditions: [unknown, string, Record<string, unknown>][] = [
            [filters.startDate, "transaction.date >= :startDate", { startDate: filters.startDate }],
            [filters.endDate, "transaction.date <= :endDate", { endDate: filters.endDate }],
            [filters.minAmount, "transaction.amount >= :minAmount", { minAmount: filters.minAmount }],
            [filters.maxAmount, "transaction.amount <= :maxAmount", { maxAmount: filters.maxAmount }],
            [filters.type, "transaction.type = :type", { type: filters.type }],
            [filters.categoryId, "transaction.categoryId = :categoryId", { categoryId: filters.categoryId }],
            [filters.cardId, "transaction.cardId = :cardId", { cardId: filters.cardId }],
        ];

        return conditions
            .filter(([value]) => value !== undefined)
            .map(([, clause, params]) => ({ clause, params }));
    }
}
