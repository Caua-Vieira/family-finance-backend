import { Inject } from "typescript-ioc";
import { TransactionRepository } from "../../domain/contracts/transaction-repository";
import { TransactionDTO } from "../../domain/types/transaction-dto";
import { TransactionFiltersDTO } from "../../domain/types/transaction-filters-dto";
import { ProjectedTransactionDTO } from "../../domain/types/projected-transaction-dto";
import { Transaction } from "../../infrastructure/entities/transactions";
import { ImportExpensesInput } from "../../domain/types/import-expenses-dto";
import { RecurringTransactionUseCase } from "./recurring-transaction-usecase";
import { isFutureMonth, MonthPeriod } from "./utils/month-period";

export class TransactionUseCase {

    constructor(
        @Inject private readonly transactionRepository: TransactionRepository,
        @Inject private readonly recurringTransactionUseCase: RecurringTransactionUseCase
    ) { }

    async create(input: TransactionDTO): Promise<void> {
        await this.transactionRepository.create(input);
    }

    async importExpenses(input: ImportExpensesInput): Promise<number> {
        if (input.rows.length === 0) return 0;

        const transactions: TransactionDTO[] = input.rows.map((row) => ({
            type: "expense",
            amount: row.amount,
            description: row.description,
            date: row.date,
            cardId: input.cardId ?? null,
            categoryId: null,
            userId: input.userId,
            householdId: input.householdId,
        }));

        await this.transactionRepository.createMany(transactions);

        return transactions.length;
    }

    async list(
        householdId: string,
        filters: TransactionFiltersDTO,
        period?: MonthPeriod
    ): Promise<(Transaction | ProjectedTransactionDTO)[]> {
        const transactions = await this.transactionRepository.findByHouseholdId(householdId, filters);

        if (!period || !isFutureMonth(period)) {
            return transactions;
        }

        const projected = await this.recurringTransactionUseCase.getProjectedForMonth(
            householdId,
            period.month,
            period.year
        );

        return [...transactions, ...projected];
    }

    async update(input: TransactionDTO): Promise<void> {
        await this.transactionRepository.update(input);
    }

    async delete(id: string, householdId: string): Promise<void> {
        await this.transactionRepository.delete(id, householdId);
    }
}
