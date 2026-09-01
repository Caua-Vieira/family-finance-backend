import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { RecurringTransactionUseCase } from "../../../application/usecases/recurring-transaction-usecase";

@Singleton
export class RecurringTransactionController {

    constructor(
        @Inject private readonly recurringTransactionUseCase: RecurringTransactionUseCase,
    ) { }

    async list(req: Request, res: Response) {
        const { householdId } = (req as any).user;

        const rules = await this.recurringTransactionUseCase.list(householdId);

        res.status(200).json(rules);
    }

    async create(req: Request, res: Response) {
        const { type, amount, description, categoryId, cardId, userId, dayOfMonth, startDate, endDate, active } = req.body;
        const { householdId } = (req as any).user;

        const rule = await this.recurringTransactionUseCase.create({
            householdId,
            type,
            amount,
            description,
            categoryId,
            cardId,
            userId,
            dayOfMonth,
            startDate,
            endDate,
            active,
        });

        res.status(201).json(rule);
    }

    async update(req: Request, res: Response) {
        const id = String(req.params.id);
        const { type, amount, description, categoryId, cardId, userId, dayOfMonth, startDate, endDate, active } = req.body;
        const { householdId } = (req as any).user;

        const rule = await this.recurringTransactionUseCase.update({
            id,
            householdId,
            type,
            amount,
            description,
            categoryId,
            cardId,
            userId,
            dayOfMonth,
            startDate,
            endDate,
            active,
        });

        res.status(200).json(rule);
    }

    async generate(req: Request, res: Response) {
        const month = this.parseMonthOrYear(req.body.month);
        const year = this.parseMonthOrYear(req.body.year);

        const generated = await this.recurringTransactionUseCase.generateForMonth(month, year);

        res.status(200).json({ generated });
    }

    private parseMonthOrYear(value: unknown): number | undefined {
        if (value === undefined || value === null) return undefined;
        const number = Number(value);
        return Number.isInteger(number) ? number : undefined;
    }
}
