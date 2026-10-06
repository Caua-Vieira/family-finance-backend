import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { StatementEntryUseCase } from "../../../application/usecases/statement-entry-usecase";
import { StatementEntryFiltersDTO } from "../../../domain/types/statement-entry-filters-dto";
import { StatementImportEntryDTO } from "../../../domain/types/import-statement-dto";
import { parseDate, parseNumber } from "./utils/query-parsers";
import { parseAmount, parseDate as parseSpreadsheetDate, parseSpreadsheetRows } from "./utils/excel-transaction-parser";

const MAX_IMPORT_ENTRIES = 1000;

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

    async previewImport(req: Request, res: Response) {
        const file = req.file;
        const { householdId } = (req as any).user;
        const cardId = parseNumber(req.body.cardId);

        if (!file) {
            res.status(400).json({ error: "Nenhum arquivo enviado" });
            return;
        }
        if (cardId === undefined) {
            res.status(400).json({ error: "Informe o cartão do extrato" });
            return;
        }

        const { rows, errors } = parseSpreadsheetRows(file.buffer);

        if (rows.length === 0) {
            res.status(400).json({ error: errors[0] ?? "Nenhum item válido encontrado no arquivo", details: errors });
            return;
        }
        if (rows.length > MAX_IMPORT_ENTRIES) {
            res.status(400).json({ error: `O arquivo tem mais de ${MAX_IMPORT_ENTRIES} itens` });
            return;
        }

        const preview = await this.statementEntryUseCase.previewImport(householdId, cardId, rows);

        res.status(200).json({ rows: preview, errors });
    }

    async importEntries(req: Request, res: Response) {
        const { householdId } = (req as any).user;
        const cardId = Number(req.body.cardId);
        const rawEntries: unknown = req.body.entries;

        if (!Number.isInteger(cardId)) {
            res.status(400).json({ error: "Informe o cartão do extrato" });
            return;
        }
        if (!Array.isArray(rawEntries) || rawEntries.length === 0) {
            res.status(400).json({ error: "Nenhum item selecionado para importar" });
            return;
        }
        if (rawEntries.length > MAX_IMPORT_ENTRIES) {
            res.status(400).json({ error: `Importe no máximo ${MAX_IMPORT_ENTRIES} itens por vez` });
            return;
        }

        const entries: StatementImportEntryDTO[] = [];
        for (const [index, raw] of rawEntries.entries()) {
            const date = parseSpreadsheetDate(raw?.date);
            const description = typeof raw?.description === "string" ? raw.description.trim() : "";
            const amount = parseAmount(raw?.amount);

            if (!date || !description || amount === null) {
                res.status(400).json({ error: `Item ${index + 1}: data, descrição e valor são obrigatórios` });
                return;
            }

            entries.push({ date, description, amount, categoryId: this.parseCategoryId(raw?.categoryId) ?? null });
        }

        const imported = await this.statementEntryUseCase.importEntries(householdId, cardId, entries);

        res.status(201).json({ imported });
    }

    private parseCategoryId(value: unknown): number | null | undefined {
        if (value === undefined) return undefined;
        if (value === null || value === "") return null;
        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
    }
}
