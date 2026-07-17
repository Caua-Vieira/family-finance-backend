import { CreateTransactionDTO } from "../types/create-transaction-dto";

export abstract class TransactionRepository {
    abstract create(data: CreateTransactionDTO): Promise<void>;
}
