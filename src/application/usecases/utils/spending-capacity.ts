import {
    PressuredCategoryDTO,
    SpendingCapacityDTO,
    SpendingQuestionDTO,
} from "../../../domain/types/spending-capacity-dto";

export interface SpendingCapacityInput {
    // YYYY-MM-DD no horário de Brasília
    today: string;
    income: number;
    expenses: number;
    investments: number;
    amount?: number;
    pressuredCategories?: PressuredCategoryDTO[];
}

const SAFETY_MARGIN_RATE = 0.1;
const PRESSURE_THRESHOLD = 90;

function round(value: number): number {
    return Math.round(value * 100) / 100;
}

function formatBrl(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseToday(today: string): { year: number; month: number; day: number; daysInMonth: number } {
    const [year, month, day] = today.split("-").map(Number);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return { year, month, day, daysInMonth };
}

export function selectPressuredCategories(
    categories: { categoryName: string; budgeted: number; spent: number; percentageSpent: number | null }[]
): PressuredCategoryDTO[] {
    return categories.flatMap(({ categoryName, budgeted, spent, percentageSpent }) =>
        budgeted > 0 && percentageSpent !== null && percentageSpent >= PRESSURE_THRESHOLD
            ? [{ categoryName, budgeted, spent, percentageSpent }]
            : []
    );
}

function buildQuestion(amount: number, balance: number, safetyMargin: number): SpendingQuestionDTO {
    const balanceAfter = round(balance - amount);

    if (balanceAfter < 0) {
        return {
            amount,
            balanceAfter,
            verdict: "no",
            message: `Não cabe: passa ${formatBrl(Math.abs(balanceAfter))} do saldo que resta no mês.`,
        };
    }

    if (balanceAfter < safetyMargin) {
        return {
            amount,
            balanceAfter,
            verdict: "tight",
            message: `Cabe, mas o mês fica apertado: sobram só ${formatBrl(balanceAfter)} depois disso.`,
        };
    }

    return {
        amount,
        balanceAfter,
        verdict: "ok",
        message: `Cabe: depois disso ainda sobram ${formatBrl(balanceAfter)} no mês.`,
    };
}

/**
 * Calcula quanto ainda dá para gastar no mês. Função pura: o assistente de IA
 * nunca faz esta conta, ele só lê o resultado.
 */
export function calculateSpendingCapacity(input: SpendingCapacityInput): SpendingCapacityDTO {
    const { year, month, day, daysInMonth } = parseToday(input.today);
    const daysLeft = daysInMonth - day + 1;

    const balance = round(input.income - input.expenses);
    const safetyMargin = round(Math.max(input.income, 0) * SAFETY_MARGIN_RATE);
    const dailyAllowance = balance > 0 ? round(balance / daysLeft) : 0;
    const weekendAllowance = round(dailyAllowance * Math.min(2, daysLeft));

    const result: SpendingCapacityDTO = {
        today: input.today,
        month,
        year,
        income: round(input.income),
        expenses: round(input.expenses),
        investments: round(input.investments),
        balance,
        daysLeft,
        dailyAllowance,
        weekendAllowance,
        safetyMargin,
        incomeRegistered: input.income > 0,
        pressuredCategories: input.pressuredCategories ?? [],
    };

    if (input.amount !== undefined && input.amount > 0) {
        result.question = buildQuestion(round(input.amount), balance, safetyMargin);
    }

    return result;
}
