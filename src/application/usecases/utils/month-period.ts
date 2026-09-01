export interface MonthPeriod {
    month: number;
    year: number;
}

/**
 * true quando o mês/ano informado é estritamente posterior ao mês/ano atual.
 */
export function isFutureMonth(period: MonthPeriod, reference: Date = new Date()): boolean {
    const currentMonth = reference.getFullYear() * 12 + reference.getMonth();
    const targetMonth = period.year * 12 + (period.month - 1);
    return targetMonth > currentMonth;
}
