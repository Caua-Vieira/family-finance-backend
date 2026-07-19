import { CreateTransactionDTO } from "../types/create-transaction-dto";
import { TransactionFiltersDTO } from "../types/transaction-filters-dto";
import { Transaction } from "../../infrastructure/entities/transactions";

export abstract class TransactionRepository {
    abstract create(data: CreateTransactionDTO): Promise<void>;
    abstract findByHouseholdId(householdId: string, filters: TransactionFiltersDTO): Promise<Transaction[]>;
}
