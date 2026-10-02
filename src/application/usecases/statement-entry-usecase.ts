import { Inject } from "typescript-ioc";
import { StatementEntryRepository } from "../../domain/contracts/statement-entry-repository";
import { CardRepository } from "../../domain/contracts/card-repository";
import { NotFoundException } from "../../domain/errors/errors";
import { StatementEntryDTO } from "../../domain/types/statement-entry-dto";
import { StatementEntryFiltersDTO } from "../../domain/types/statement-entry-filters-dto";
import { ParsedExpenseRowDTO } from "../../domain/types/import-expenses-dto";
import { StatementImportEntryDTO, StatementImportPreviewRowDTO } from "../../domain/types/import-statement-dto";
import { StatementEntry } from "../../infrastructure/entities/statement-entry";

function toIsoDay(value: Date | string): string {
    return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function normalizeText(value: string): string {
    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// Para sugerir subcategoria: ignora pontuação e palavras com dígitos, que variam
// entre compras do mesmo lugar ("UBER *TRIP 8F3K", "IFOOD 2/3").
function descriptionKey(value: string): string {
    return normalizeText(value)
        .split(" ")
        .filter((word) => !/\d/.test(word))
        .map((word) => word.replace(/[^a-z]/g, ""))
        .filter((word) => word.length >= 2)
        .join(" ");
}

function duplicateKey(date: Date | string, amount: number, description: string): string {
    return `${toIsoDay(date)}|${Number(amount).toFixed(2)}|${normalizeText(description)}`;
}

export class StatementEntryUseCase {

    constructor(
        @Inject private readonly statementEntryRepository: StatementEntryRepository,
        @Inject private readonly cardRepository: CardRepository,
    ) { }

    async create(input: StatementEntryDTO): Promise<StatementEntry> {
        return this.statementEntryRepository.create(input);
    }

    async update(input: StatementEntryDTO): Promise<StatementEntry> {
        return this.statementEntryRepository.update(input);
    }

    async delete(id: string, householdId: string): Promise<void> {
        await this.statementEntryRepository.delete(id, householdId);
    }

    async list(householdId: string, filters: StatementEntryFiltersDTO): Promise<StatementEntry[]> {
        return this.statementEntryRepository.findByHouseholdId(householdId, filters);
    }

    /**
     * Monta a prévia de um extrato importado sem salvar nada: marca itens que já
     * existem no cartão e sugere a subcategoria com base no histórico da família.
     */
    async previewImport(
        householdId: string,
        cardId: number,
        rows: ParsedExpenseRowDTO[]
    ): Promise<StatementImportPreviewRowDTO[]> {
        await this.ensureCardBelongsToHousehold(cardId, householdId);

        // Ordenado por data desc: a primeira categoria vista para uma descrição é a mais recente.
        const existing = await this.statementEntryRepository.findByHouseholdId(householdId, {});

        const existingKeys = new Set(
            existing
                .filter((entry) => entry.cardId === cardId)
                .map((entry) => duplicateKey(entry.date, entry.amount, entry.description))
        );

        const suggestions = new Map<string, number>();
        for (const entry of existing) {
            const key = descriptionKey(entry.description);
            if (entry.categoryId != null && key && !suggestions.has(key)) {
                suggestions.set(key, entry.categoryId);
            }
        }

        return rows.map((row) => ({
            line: row.line,
            date: toIsoDay(row.date),
            description: row.description,
            amount: row.amount,
            suggestedCategoryId: suggestions.get(descriptionKey(row.description)) ?? null,
            duplicate: existingKeys.has(duplicateKey(row.date, row.amount, row.description)),
        }));
    }

    async importEntries(householdId: string, cardId: number, entries: StatementImportEntryDTO[]): Promise<number> {
        await this.ensureCardBelongsToHousehold(cardId, householdId);

        await this.statementEntryRepository.createMany(
            entries.map((entry) => ({ ...entry, householdId, cardId }))
        );

        return entries.length;
    }

    private async ensureCardBelongsToHousehold(cardId: number, householdId: string): Promise<void> {
        const cards = await this.cardRepository.findByHouseholdId(householdId);
        if (!cards.some((card) => card.id === cardId)) {
            throw new NotFoundException("Cartão não encontrado");
        }
    }
}
