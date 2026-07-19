export interface TransactionFiltersDTO {
    startDate?: Date;
    endDate?: Date;
    minAmount?: number;
    maxAmount?: number;
    type?: "income" | "expense";
    categoryId?: string;
    cardId?: string;
}
