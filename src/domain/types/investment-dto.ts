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

export interface InvestmentDTO {
    id?: string;
    householdId: string;
    name: string;
    type: InvestmentType;
    institution: string | null;
    investedAmount: number;
    currentValue: number;
}
