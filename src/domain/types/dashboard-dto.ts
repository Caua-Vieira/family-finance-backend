export interface MonthlyTotalsRow {
    income: string;
    expenses: string;
}

export interface CategorySpendingRow {
    category_id: number;
    category_name: string;
    budgeted: string;
    spent: string;
}

export interface MonthlyTotalsDTO {
    income: number;
    expenses: number;
}

export interface CategorySpendingDTO {
    categoryId: number;
    categoryName: string;
    budgeted: number;
    spent: number;
}

export interface DashboardCategorySummaryDTO extends CategorySpendingDTO {
    percentageSpent: number | null;
}

export interface DashboardSummaryDTO {
    month: number;
    year: number;
    income: number;
    expenses: number;
    balance: number;
    categories: DashboardCategorySummaryDTO[];
    previousMonth: {
        month: number;
        year: number;
        income: number;
        expenses: number;
        expensesVariationPercentage: number | null;
    };
}
