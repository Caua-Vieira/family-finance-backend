import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { TransactionUseCase } from "../../../application/usecases/transaction-usecase";
import { TransactionFiltersDTO } from "../../../domain/types/transaction-filters-dto";
import { parseDate, parseNumber, parseTransactionType } from "./utils/query-parsers";
import { parseExcelExpenses } from "./utils/excel-transaction-parser";

@Singleton
export class TransactionController {

    constructor(
        @Inject private readonly transactionUseCase: TransactionUseCase,
    ) { }

    async import(req: Request, res: Response) {
        const file = req.file;

        if (!file) {
            res.status(400).json({ error: "Nenhum arquivo enviado" });
            return;
        }

        const { id: userId, householdId } = (req as any).user;
        const cardId = typeof req.body.cardId === "string" && req.body.cardId.trim() !== "" ? req.body.cardId : null;

        const { rows, errors } = parseExcelExpenses(file.buffer);

        if (rows.length === 0) {
            res.status(400).json({ error: "Nenhum item válido encontrado na planilha", details: errors });
            return;
        }

        const imported = await this.transactionUseCase.importExpenses({ rows, householdId, userId, cardId });

        res.status(201).json({ imported, skipped: errors.length, errors });
    }

    async create(req: Request, res: Response) {
        const { type, amount, description, date, categoryId, cardId } = req.body;
        const { id: userId, householdId } = (req as any).user;

        await this.transactionUseCase.create({ type, amount, description, date, categoryId, cardId, userId, householdId });

        res.status(201).send();
    }

    async list(req: Request, res: Response) {
        const { householdId } = (req as any).user;
        const { startDate, endDate, minAmount, maxAmount, type, categoryId, cardId, month, year } = req.query;

        const filters: TransactionFiltersDTO = {
            startDate: parseDate(startDate),
            endDate: parseDate(endDate),
            minAmount: parseNumber(minAmount),
            maxAmount: parseNumber(maxAmount),
            type: parseTransactionType(type),
            categoryId: typeof categoryId === "string" ? categoryId : undefined,
            cardId: typeof cardId === "string" ? cardId : undefined,
        };

        const resolvedMonth = parseNumber(month);
        const resolvedYear = parseNumber(year);
        const period =
            resolvedMonth !== undefined && resolvedYear !== undefined
                ? { month: resolvedMonth, year: resolvedYear }
                : undefined;

        const transactions = await this.transactionUseCase.list(householdId, filters, period);

        res.status(200).json(transactions);
    }

    async update(req: Request, res: Response) {
        const id = String(req.params.id);
        const { type, amount, description, date, categoryId, cardId } = req.body;
        const { householdId } = (req as any).user;

        await this.transactionUseCase.update({ id, householdId, type, amount, description, date, categoryId, cardId });

        res.status(204).send();
    }

    async delete(req: Request, res: Response) {
        const id = String(req.params.id);
        const { householdId } = (req as any).user;

        await this.transactionUseCase.delete(id, householdId);

        res.status(204).send();
    }
}
