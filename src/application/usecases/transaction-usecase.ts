import { Inject } from "typescript-ioc";
import { TransactionRepository } from "../../domain/contracts/transaction-repository";
import { CreateTransactionDTO } from "../../domain/types/create-transaction-dto";

export class TransactionUseCase {

    constructor(
        @Inject private readonly transactionRepository: TransactionRepository
    ) { }

    async create(input: CreateTransactionDTO): Promise<void> {
        await this.transactionRepository.create(input);
    }
}
