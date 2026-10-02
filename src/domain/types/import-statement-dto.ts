export interface StatementImportPreviewRowDTO {
    line: number;
    date: string;
    description: string;
    amount: number;
    suggestedCategoryId: number | null;
    duplicate: boolean;
}

export interface StatementImportEntryDTO {
    date: Date;
    description: string;
    amount: number;
    categoryId: number | null;
}
