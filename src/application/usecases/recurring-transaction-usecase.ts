import { Inject } from "typescript-ioc";
import { RecurringTransactionRepository } from "../../domain/contracts/recurring-transaction-repository";
import { TransactionRepository } from "../../domain/contracts/transaction-repository";
import { RecurringTransactionDTO } from "../../domain/types/recurring-transaction-dto";
import { TransactionDTO } from "../../domain/types/transaction-dto";
import { ProjectedTransactionDTO } from "../../domain/types/projected-transaction-dto";
import { RecurringTransaction } from "../../infrastructure/entities/recurring-transactions";

function pad(value: number): string {
    return String(value).padStart(2, "0");
}

function isoDate(year: number, month: number, day: number): string {
    return `${year}-${pad(month)}-${pad(day)}`;
}

function toIsoDate(value: unknown): string {
    if (value instanceof Date) {
        return isoDate(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
    }
    return String(value).slice(0, 10);
}

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

    /**
     * Calcula (sem persistir) os lançamentos que as regras ativas do household
     * gerariam no mês/ano informado. Mesma regra de elegibilidade e de data da
     * geração real. Regras que já possuem um lançamento real naquele mês são
     * omitidas para não duplicar a exibição.
     */
    async getProjectedForMonth(householdId: string, month: number, year: number): Promise<ProjectedTransactionDTO[]> {
        const periodStart = new Date(Date.UTC(year, month - 1, 1));
        const periodEnd = new Date(Date.UTC(year, month, 0));
        const daysInMonth = periodEnd.getUTCDate();
        const periodStartStr = isoDate(year, month, 1);
        const periodEndStr = isoDate(year, month, daysInMonth);

        const rules = await this.recurringTransactionRepository.findByHouseholdId(householdId);

        const eligible = rules.filter((rule) => {
            if (!rule.active) return false;
            const start = toIsoDate(rule.startDate);
            const end = rule.endDate ? toIsoDate(rule.endDate) : null;
            return start <= periodEndStr && (end === null || end >= periodStartStr);
        });

        if (eligible.length === 0) return [];

        const alreadyGenerated = new Set(
            await this.transactionRepository.findGeneratedRecurringIds(periodStart, periodEnd)
        );

        return eligible
            .filter((rule) => !alreadyGenerated.has(rule.id))
            .map((rule) => ({
                id: null,
                type: rule.type,
                amount: Number(rule.amount),
                description: rule.description,
                date: isoDate(year, month, Math.min(rule.dayOfMonth, daysInMonth)),
                categoryId: rule.categoryId,
                cardId: rule.cardId,
                userId: rule.userId,
                recurringTransactionId: rule.id,
                isProjected: true as const,
            }));
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
