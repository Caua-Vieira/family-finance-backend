export interface BudgetDTO {
    id?: string;
    categoryId: string;
    month: number;
    year: number;
    estimatedAmount: number;
    householdId: string;
}
