import { Inject } from "typescript-ioc";
import { TransactionRepository } from "../../../domain/contracts/transaction-repository";
import { DatabaseException } from "../../../domain/errors/errors";
import { Transaction } from "../../entities/transactions";
import { Database } from "../../database/database";
import { CreateTransactionDTO } from "../../../domain/types/create-transaction-dto";

export class HttpTransactionRepository implements TransactionRepository {
    constructor(@Inject private database: Database) { }

    async create(data: CreateTransactionDTO): Promise<void> {
        try {
            const repository = this.database.getRepository(Transaction);
            const transaction = repository.create(data);
            await repository.save(transaction);
        } catch (error) {
            console.log(error)
            throw new DatabaseException("Ocorreu um erro ao registrar a transação");
        }
    }
}
