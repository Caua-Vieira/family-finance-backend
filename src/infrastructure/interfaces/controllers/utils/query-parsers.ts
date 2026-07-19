export function parseDate(value: unknown): Date | undefined {
    if (typeof value !== "string") return undefined;
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
}

export function parseNumber(value: unknown): number | undefined {
    if (typeof value !== "string") return undefined;
    const number = Number(value);
    return isNaN(number) ? undefined : number;
}

export function parseTransactionType(value: unknown): "income" | "expense" | undefined {
    return value === "income" || value === "expense" ? value : undefined;
}
