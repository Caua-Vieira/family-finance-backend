export interface CreateTransactionDTO {
    type: "income" | "expense";
    amount: number;
    description: string;
    date: Date;
    categoryId?: string | null;
    cardId?: string | null;
    userId: string;
    householdId: string;
}
