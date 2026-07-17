import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { TransactionUseCase } from "../../../application/usecases/transaction-usecase";

@Singleton
export class TransactionController {

    constructor(
        @Inject private readonly transactionUseCase: TransactionUseCase,
    ) { }

    async create(req: Request, res: Response) {
        const { type, amount, description, date, categoryId, cardId } = req.body;
        const { id: userId, householdId } = (req as any).user;

        await this.transactionUseCase.create({ type, amount, description, date, categoryId, cardId, userId, householdId });

        res.status(201).send();
    }
}
