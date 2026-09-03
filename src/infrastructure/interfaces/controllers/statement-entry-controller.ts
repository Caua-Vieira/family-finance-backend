import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { StatementEntryUseCase } from "../../../application/usecases/statement-entry-usecase";
import { StatementEntryFiltersDTO } from "../../../domain/types/statement-entry-filters-dto";
import { parseDate, parseNumber } from "./utils/query-parsers";

@Singleton
export class StatementEntryController {

    constructor(
        @Inject private readonly statementEntryUseCase: StatementEntryUseCase,
    ) { }

    async list(req: Request, res: Response) {
        const { householdId } = (req as any).user;
        const { startDate, endDate, cardId } = req.query;

        const filters: StatementEntryFiltersDTO = {
            startDate: parseDate(startDate),
            endDate: parseDate(endDate),
            cardId: parseNumber(cardId),
        };

        const entries = await this.statementEntryUseCase.list(householdId, filters);

        res.status(200).json(entries);
    }

    async create(req: Request, res: Response) {
        const { cardId, categoryId, description, amount, date } = req.body;
        const { householdId } = (req as any).user;

        const entry = await this.statementEntryUseCase.create({
            householdId,
            cardId: Number(cardId),
            categoryId: this.parseCategoryId(categoryId) ?? null,
            description,
            amount: Number(amount),
            date,
        });

        res.status(201).json(entry);
    }

    async update(req: Request, res: Response) {
        const id = String(req.params.id);
        const { cardId, categoryId, description, amount, date } = req.body;
        const { householdId } = (req as any).user;

        const entry = await this.statementEntryUseCase.update({
            id,
            householdId,
            cardId: cardId === undefined ? undefined : Number(cardId),
            categoryId: this.parseCategoryId(categoryId),
            description,
            amount: amount === undefined ? undefined : Number(amount),
            date,
        });

        res.status(200).json(entry);
    }

    async delete(req: Request, res: Response) {
        const id = String(req.params.id);
        const { householdId } = (req as any).user;

        await this.statementEntryUseCase.delete(id, householdId);

        res.status(204).send();
    }

    private parseCategoryId(value: unknown): number | null | undefined {
        if (value === undefined) return undefined;
        if (value === null || value === "") return null;
        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
    }
}
