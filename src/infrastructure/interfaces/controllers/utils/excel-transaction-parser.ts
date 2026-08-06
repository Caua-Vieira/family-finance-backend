import * as XLSX from "xlsx";
import { ParsedExpenseRowDTO } from "../../../../domain/types/import-expenses-dto";

export interface ParseExcelExpensesResult {
    rows: ParsedExpenseRowDTO[];
    errors: string[];
}

const DATE_HEADERS = ["data", "date"];
const DESCRIPTION_HEADERS = ["descricao", "descrição", "description", "historico", "histórico", "estabelecimento"];
const AMOUNT_HEADERS = ["valor", "amount", "valor (r$)"];

function normalizeHeader(header: unknown): string {
    return String(header ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
}

function findColumnIndex(headerRow: unknown[], candidates: string[]): number {
    const normalized = headerRow.map(normalizeHeader);
    return normalized.findIndex((header) => candidates.some((candidate) => header === normalizeHeader(candidate)));
}

function parseAmount(raw: unknown): number | null {
    if (typeof raw === "number") return raw;
    if (typeof raw !== "string") return null;

    const cleaned = raw
        .replace(/[^\d,.-]/g, "")
        .replace(/\.(?=\d{3}(?:\D|$))/g, "")
        .replace(",", ".");

    if (cleaned === "" || cleaned === "-") return null;

    const value = Number(cleaned);
    return isNaN(value) ? null : value;
}

function parseDate(raw: unknown): Date | null {
    if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;

    if (typeof raw === "number") {
        const parsed = XLSX.SSF.parse_date_code(raw);
        if (!parsed) return null;
        const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
        return isNaN(date.getTime()) ? null : date;
    }

    if (typeof raw === "string") {
        const brMatch = raw.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
        if (brMatch) {
            const [, day, month, yearRaw] = brMatch;
            const year = yearRaw.length === 2 ? Number(`20${yearRaw}`) : Number(yearRaw);
            const date = new Date(Date.UTC(year, Number(month) - 1, Number(day)));
            return isNaN(date.getTime()) ? null : date;
        }

        const date = new Date(raw);
        return isNaN(date.getTime()) ? null : date;
    }

    return null;
}

export function parseExcelExpenses(buffer: Buffer): ParseExcelExpensesResult {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });

    if (rows.length < 2) {
        return { rows: [], errors: ["A planilha não contém dados para importar"] };
    }

    const [headerRow, ...dataRows] = rows;

    const dateIndex = findColumnIndex(headerRow, DATE_HEADERS);
    const descriptionIndex = findColumnIndex(headerRow, DESCRIPTION_HEADERS);
    const amountIndex = findColumnIndex(headerRow, AMOUNT_HEADERS);

    if (dateIndex === -1 || descriptionIndex === -1 || amountIndex === -1) {
        return {
            rows: [],
            errors: ["Não foi possível identificar as colunas de Data, Descrição e Valor na planilha"],
        };
    }

    const errors: string[] = [];
    const parsedRows: ParsedExpenseRowDTO[] = [];

    dataRows.forEach((row, index) => {
        const line = index + 2;

        const date = parseDate(row[dateIndex]);
        const description = String(row[descriptionIndex] ?? "").trim();
        const amount = parseAmount(row[amountIndex]);

        if (!date || !description || amount === null) {
            errors.push(`Linha ${line}: dados inválidos, item ignorado`);
            return;
        }

        parsedRows.push({ line, date, description, amount: Math.abs(amount) });
    });

    return { rows: parsedRows, errors };
}
