export interface TransactionDTO {
    id?: string;
    type: "income" | "expense" | "investment";
    amount: number;
    description: string;
    date: Date;
    categoryId?: string | null;
    cardId?: string | null;
    userId?: string;
    householdId: string;
    recurringTransactionId?: string | null;
}
