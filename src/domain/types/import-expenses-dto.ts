export interface ParsedExpenseRowDTO {
    line: number;
    description: string;
    amount: number;
    date: Date;
}

export interface ImportExpensesInput {
    rows: ParsedExpenseRowDTO[];
    householdId: string;
    userId: string;
    cardId?: string | null;
}