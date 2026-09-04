export interface StatementEntryDTO {
    id?: string;
    householdId: string;
    cardId?: number;
    categoryId?: number | null;
    description?: string;
    amount?: number;
    date?: Date;
}
