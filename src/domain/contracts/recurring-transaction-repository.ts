import { RecurringTransaction } from "../../infrastructure/entities/recurring-transactions";
import { RecurringTransactionDTO } from "../types/recurring-transaction-dto";

export abstract class RecurringTransactionRepository {
    abstract create(data: RecurringTransactionDTO): Promise<RecurringTransaction>;
    abstract update(data: RecurringTransactionDTO): Promise<RecurringTransaction>;
    abstract findByHouseholdId(householdId: string): Promise<RecurringTransaction[]>;
    abstract findActiveForPeriod(periodStart: Date, periodEnd: Date): Promise<RecurringTransaction[]>;
}
