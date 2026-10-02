import * as XLSX from "xlsx";
import { ParsedExpenseRowDTO } from "../../../../domain/types/import-expenses-dto";

export interface ParseExcelExpensesResult {
    rows: ParsedExpenseRowDTO[];
    errors: string[];
}

const DATE_HEADERS = ["data", "date", "data da compra", "data compra", "data lancamento", "data do lancamento"];
const DESCRIPTION_HEADERS = [
    "descricao", "description", "historico", "estabelecimento", "lancamento", "title", "titulo",
];
const AMOUNT_HEADERS = ["valor", "amount", "valor (r$)", "valor r$", "valor (em r$)", "valor em r$"];

// Linhas iniciais varridas atrás do cabeçalho — extratos de banco costumam
// trazer nome do titular, período etc. antes da tabela.
const HEADER_SCAN_LIMIT = 20;

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

export function parseAmount(raw: unknown): number | null {
    if (typeof raw === "number") return raw;
    if (typeof raw !== "string") return null;

    let cleaned = raw.replace(/[^\d,.-]/g, "");
    if (cleaned === "" || cleaned === "-") return null;

    const lastComma = cleaned.lastIndexOf(",");
    const lastDot = cleaned.lastIndexOf(".");

    if (lastComma !== -1 && lastDot !== -1) {
        // O separador que aparece por último é o decimal: "1.234,56" ou "1,234.56"
        cleaned = lastComma > lastDot
            ? cleaned.replace(/\./g, "").replace(",", ".")
            : cleaned.replace(/,/g, "");
    } else if (lastComma !== -1) {
        cleaned = cleaned.replace(",", ".");
    } else if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) {
        // "1.234" sem vírgula é milhar no padrão brasileiro
        cleaned = cleaned.replace(/\./g, "");
    }

    const value = Number(cleaned);
    return isNaN(value) ? null : value;
}

export function parseDate(raw: unknown): Date | null {
    if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;

    if (typeof raw === "number") {
        const parsed = XLSX.SSF.parse_date_code(raw);
        if (!parsed) return null;
        const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
        return isNaN(date.getTime()) ? null : date;
    }

    if (typeof raw === "string") {
        const brMatch = raw.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
        if (brMatch) {
            const [, day, month, yearRaw] = brMatch;
            const year = yearRaw.length === 2 ? Number(`20${yearRaw}`) : Number(yearRaw);
            const date = new Date(Date.UTC(year, Number(month) - 1, Number(day)));
            return isNaN(date.getTime()) ? null : date;
        }

        const isoMatch = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            const [, year, month, day] = isoMatch;
            const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
            return isNaN(date.getTime()) ? null : date;
        }

        const date = new Date(raw);
        return isNaN(date.getTime()) ? null : date;
    }

    return null;
}

function isBinarySpreadsheet(buffer: Buffer): boolean {
    const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b; // .xlsx
    const isOle = buffer[0] === 0xd0 && buffer[1] === 0xcf && buffer[2] === 0x11 && buffer[3] === 0xe0; // .xls
    return isZip || isOle;
}

// CSVs de banco brasileiro muitas vezes vêm em Latin-1 em vez de UTF-8.
function decodeText(buffer: Buffer): string {
    const utf8 = buffer.toString("utf8");
    const text = utf8.includes("�") ? buffer.toString("latin1") : utf8;
    return text.replace(/^﻿/, "");
}

function readSheetRows(buffer: Buffer): unknown[][] {
    // No CSV, `raw: true` mantém tudo como texto: sem isso o SheetJS interpreta
    // "05/09/2026" no padrão americano (mês/dia).
    const workbook = isBinarySpreadsheet(buffer)
        ? XLSX.read(buffer, { type: "buffer" })
        : XLSX.read(decodeText(buffer), { type: "string", raw: true });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // Mantém as linhas em branco para que o número da linha nos erros bata com o arquivo.
    return XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: true, defval: "" });
}

/**
 * Lê um extrato/planilha (.csv, .xlsx ou .xls) e devolve as linhas com data,
 * descrição e valor. O valor mantém o sinal do arquivo (negativos costumam ser
 * pagamentos/estornos).
 */
export function parseSpreadsheetRows(buffer: Buffer): ParseExcelExpensesResult {
    let rows: unknown[][];
    try {
        rows = readSheetRows(buffer);
    } catch {
        return { rows: [], errors: ["Não foi possível ler o arquivo. Envie um CSV ou uma planilha Excel válida"] };
    }

    const headerIndex = rows
        .slice(0, HEADER_SCAN_LIMIT)
        .findIndex((row) =>
            findColumnIndex(row, DATE_HEADERS) !== -1 &&
            findColumnIndex(row, DESCRIPTION_HEADERS) !== -1 &&
            findColumnIndex(row, AMOUNT_HEADERS) !== -1
        );

    if (headerIndex === -1) {
        return {
            rows: [],
            errors: ["Não foi possível identificar as colunas de Data, Descrição e Valor no arquivo"],
        };
    }

    const headerRow = rows[headerIndex];
    const dateIndex = findColumnIndex(headerRow, DATE_HEADERS);
    const descriptionIndex = findColumnIndex(headerRow, DESCRIPTION_HEADERS);
    const amountIndex = findColumnIndex(headerRow, AMOUNT_HEADERS);

    const errors: string[] = [];
    const parsedRows: ParsedExpenseRowDTO[] = [];

    rows.slice(headerIndex + 1).forEach((row, index) => {
        if (row.every((cell) => String(cell ?? "").trim() === "")) return;

        const line = headerIndex + index + 2;

        const date = parseDate(row[dateIndex]);
        const description = String(row[descriptionIndex] ?? "").trim();
        const amount = parseAmount(row[amountIndex]);

        if (!date || !description || amount === null) {
            errors.push(`Linha ${line}: dados inválidos, item ignorado`);
            return;
        }

        parsedRows.push({ line, date, description, amount });
    });

    if (parsedRows.length === 0 && errors.length === 0) {
        errors.push("O arquivo não contém dados para importar");
    }

    return { rows: parsedRows, errors };
}

export function parseExcelExpenses(buffer: Buffer): ParseExcelExpensesResult {
    const { rows, errors } = parseSpreadsheetRows(buffer);
    return { rows: rows.map((row) => ({ ...row, amount: Math.abs(row.amount) })), errors };
}
