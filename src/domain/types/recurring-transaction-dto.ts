export interface RecurringTransactionDTO {
    id?: string;
    householdId: string;
    type?: "income" | "expense";
    amount?: number;
    description?: string;
    categoryId?: string | null;
    cardId?: string | null;
    userId?: string | null;
    dayOfMonth?: number;
    startDate?: Date;
    endDate?: Date | null;
    active?: boolean;
}
