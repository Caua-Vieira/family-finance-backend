import { TransactionDTO } from "../types/transaction-dto";
import { TransactionFiltersDTO } from "../types/transaction-filters-dto";
import { Transaction } from "../../infrastructure/entities/transactions";

export abstract class TransactionRepository {
    abstract create(data: TransactionDTO): Promise<void>;
    abstract createMany(data: TransactionDTO[]): Promise<void>;
    abstract findByHouseholdId(householdId: string, filters: TransactionFiltersDTO): Promise<Transaction[]>;
    abstract findGeneratedRecurringIds(periodStart: Date, periodEnd: Date): Promise<string[]>;
    abstract update(data: TransactionDTO): Promise<void>;
    abstract delete(id: string, householdId: string): Promise<void>;
}
