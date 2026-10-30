import { RecurringTransaction } from "../../infrastructure/entities/recurring-transactions";
import { RecurringTransactionOverride } from "../../infrastructure/entities/recurring-transaction-override";
import { RecurringTransactionDTO } from "../types/recurring-transaction-dto";

export abstract class RecurringTransactionRepository {
    abstract create(data: RecurringTransactionDTO): Promise<RecurringTransaction>;
    abstract update(data: RecurringTransactionDTO): Promise<RecurringTransaction>;
    abstract delete(id: string, householdId: string): Promise<void>;
    abstract findByIdOrFail(id: string, householdId: string): Promise<RecurringTransaction>;
    abstract findByHouseholdId(householdId: string): Promise<RecurringTransaction[]>;
    abstract findActiveForPeriod(periodStart: Date, periodEnd: Date): Promise<RecurringTransaction[]>;
    abstract findOverridesForMonth(ruleIds: string[], month: number, year: number): Promise<RecurringTransactionOverride[]>;
    abstract saveOverride(ruleId: string, month: number, year: number, amount: number): Promise<void>;
    abstract deleteOverride(ruleId: string, month: number, year: number): Promise<void>;
}
