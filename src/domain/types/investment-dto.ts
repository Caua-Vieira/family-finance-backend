export const INVESTMENT_TYPES = [
    "fixed_income",
    "stocks",
    "funds",
    "real_estate_funds",
    "crypto",
    "pension",
    "other",
] as const;

export type InvestmentType = (typeof INVESTMENT_TYPES)[number];

// Só renda fixa rende automaticamente: "cdi" = X% do CDI, "prefixed" = X% a.a.
export const INVESTMENT_INDEXERS = ["cdi", "prefixed"] as const;

export type InvestmentIndexer = (typeof INVESTMENT_INDEXERS)[number];

export interface InvestmentDTO {
    id?: string;
    householdId: string;
    name: string;
    type: InvestmentType;
    institution: string | null;
    investedAmount: number;
    currentValue: number;
    referenceDate: string | null;
    indexer: InvestmentIndexer | null;
    rate: number | null;
    monthlyContribution: number;
    contributionDay: number | null;
}

export interface InvestmentEstimateDTO {
    value: number;
    invested: number;
    contributionsApplied: number;
    ratesUntil: string | null;
    // true quando o CDI não pôde ser consultado e o valor saiu sem rendimento
    yieldUnavailable: boolean;
}
