import { InvestmentIndexer } from "../../../domain/types/investment-dto";
import { DailyRateDTO } from "../../../domain/contracts/interest-rate-service";

export interface InvestmentEstimateInput {
    balance: number;
    invested: number;
    referenceDate: string; // YYYY-MM-DD — data do saldo informado
    today: string; // YYYY-MM-DD
    indexer: InvestmentIndexer | null;
    rate: number | null; // % do CDI (ex.: 110) ou % a.a. no prefixado (ex.: 12.5)
    monthlyContribution: number;
    contributionDay: number | null;
}

export interface InvestmentEstimateResult {
    value: number;
    invested: number;
    contributionsApplied: number;
    ratesUntil: string | null;
}

function pad(n: number): string {
    return String(n).padStart(2, "0");
}

/** Datas de aporte depois do saldo informado e até hoje (o dia é limitado ao fim do mês). */
export function contributionDates(referenceDate: string, today: string, day: number): string[] {
    const [refYear, refMonth] = referenceDate.split("-").map(Number);
    const [todayYear, todayMonth] = today.split("-").map(Number);

    const dates: string[] = [];
    let year = refYear;
    let month = refMonth;

    while (year < todayYear || (year === todayYear && month <= todayMonth)) {
        const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
        const date = `${year}-${pad(month)}-${pad(Math.min(day, lastDay))}`;
        if (date > referenceDate && date <= today) dates.push(date);

        month += 1;
        if (month > 12) {
            month = 1;
            year += 1;
        }
    }

    return dates;
}

function dailyFactor(indexer: InvestmentIndexer, rate: number, cdiDailyPercent: number): number {
    if (indexer === "cdi") {
        // CDB "X% do CDI": aplica X% sobre a taxa diária do CDI
        return 1 + (cdiDailyPercent / 100) * (rate / 100);
    }
    // Prefixado: taxa anual convertida para dia útil (base 252)
    return Math.pow(1 + rate / 100, 1 / 252);
}

/**
 * Estima o valor de hoje a partir do saldo informado: rende dia útil a dia útil
 * (o calendário vem da própria série do CDI) e soma os aportes mensais, cada um
 * rendendo a partir do dia seguinte ao aporte. Não desconta IR/IOF.
 */
export function estimateInvestment(input: InvestmentEstimateInput, cdi: DailyRateDTO[]): InvestmentEstimateResult {
    const contributions =
        input.monthlyContribution > 0 && input.contributionDay
            ? contributionDates(input.referenceDate, input.today, input.contributionDay)
            : [];

    let value = input.balance;
    let applied = 0;
    let ratesUntil: string | null = null;

    if (input.indexer && input.rate) {
        const days = cdi.filter((d) => d.date > input.referenceDate && d.date <= input.today);

        for (const day of days) {
            while (applied < contributions.length && contributions[applied] < day.date) {
                value += input.monthlyContribution;
                applied++;
            }
            value *= dailyFactor(input.indexer, input.rate, day.rate);
            ratesUntil = day.date;
        }
    }

    // Aportes depois do último dia com taxa publicada entram sem rendimento.
    value += (contributions.length - applied) * input.monthlyContribution;

    return {
        value: Math.round(value * 100) / 100,
        invested: Math.round((input.invested + contributions.length * input.monthlyContribution) * 100) / 100,
        contributionsApplied: contributions.length,
        ratesUntil,
    };
}
