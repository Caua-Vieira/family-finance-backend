import { Inject } from "typescript-ioc";
import { RecurringTransactionRepository } from "../../domain/contracts/recurring-transaction-repository";
import { TransactionRepository } from "../../domain/contracts/transaction-repository";
import { RecurringTransactionDTO } from "../../domain/types/recurring-transaction-dto";
import { TransactionDTO } from "../../domain/types/transaction-dto";
import { RecurringTransaction } from "../../infrastructure/entities/recurring-transactions";

export class RecurringTransactionUseCase {

    constructor(
        @Inject private readonly recurringTransactionRepository: RecurringTransactionRepository,
        @Inject private readonly transactionRepository: TransactionRepository
    ) { }

    async create(input: RecurringTransactionDTO): Promise<RecurringTransaction> {
        const rule = await this.recurringTransactionRepository.create(input);

        await this.generateForMonth();

        return rule;
    }

    async update(input: RecurringTransactionDTO): Promise<RecurringTransaction> {
        return this.recurringTransactionRepository.update(input);
    }

    async list(householdId: string): Promise<RecurringTransaction[]> {
        return this.recurringTransactionRepository.findByHouseholdId(householdId);
    }

    async generateForMonth(month?: number, year?: number): Promise<number> {
        const now = new Date();
        const targetMonth = month ?? now.getUTCMonth() + 1;
        const targetYear = year ?? now.getUTCFullYear();

        const periodStart = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
        const periodEnd = new Date(Date.UTC(targetYear, targetMonth, 0));
        const daysInMonth = periodEnd.getUTCDate();

        const rules = await this.recurringTransactionRepository.findActiveForPeriod(periodStart, periodEnd);
        if (rules.length === 0) return 0;

        const alreadyGenerated = new Set(
            await this.transactionRepository.findGeneratedRecurringIds(periodStart, periodEnd)
        );

        const pending = rules.filter((rule) => !alreadyGenerated.has(rule.id));
        if (pending.length === 0) return 0;

        const transactions: TransactionDTO[] = pending.map((rule) => ({
            type: rule.type,
            amount: rule.amount,
            description: rule.description,
            date: new Date(Date.UTC(targetYear, targetMonth - 1, Math.min(rule.dayOfMonth, daysInMonth))),
            categoryId: rule.categoryId,
            cardId: rule.cardId,
            userId: rule.userId ?? undefined,
            householdId: rule.householdId,
            recurringTransactionId: rule.id,
        }));

        await this.transactionRepository.createMany(transactions);

        return transactions.length;
    }
}
