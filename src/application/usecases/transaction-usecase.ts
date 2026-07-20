import { Inject } from "typescript-ioc";
import { TransactionRepository } from "../../domain/contracts/transaction-repository";
import { TransactionDTO } from "../../domain/types/transaction-dto";
import { TransactionFiltersDTO } from "../../domain/types/transaction-filters-dto";
import { Transaction } from "../../infrastructure/entities/transactions";

export class TransactionUseCase {

    constructor(
        @Inject private readonly transactionRepository: TransactionRepository
    ) { }

    async create(input: TransactionDTO): Promise<void> {
        await this.transactionRepository.create(input);
    }

    async list(householdId: string, filters: TransactionFiltersDTO): Promise<Transaction[]> {
        return this.transactionRepository.findByHouseholdId(householdId, filters);
    }

    async update(input: TransactionDTO): Promise<void> {
        await this.transactionRepository.update(input);
    }

    async delete(id: string, householdId: string): Promise<void> {
        await this.transactionRepository.delete(id, householdId);
    }
}
