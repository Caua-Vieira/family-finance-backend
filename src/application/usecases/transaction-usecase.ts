import { Inject } from "typescript-ioc";
import { TransactionRepository } from "../../domain/contracts/transaction-repository";
import { CreateTransactionDTO } from "../../domain/types/create-transaction-dto";
import { TransactionFiltersDTO } from "../../domain/types/transaction-filters-dto";
import { Transaction } from "../../infrastructure/entities/transactions";

export class TransactionUseCase {

    constructor(
        @Inject private readonly transactionRepository: TransactionRepository
    ) { }

    async create(input: CreateTransactionDTO): Promise<void> {
        await this.transactionRepository.create(input);
    }

    async list(householdId: string, filters: TransactionFiltersDTO): Promise<Transaction[]> {
        return this.transactionRepository.findByHouseholdId(householdId, filters);
    }
}
