export interface ProjectedTransactionDTO {
    id: null;
    type: "income" | "expense";
    amount: number;
    description: string;
    date: string;
    categoryId: string | null;
    cardId: string | null;
    userId: string | null;
    recurringTransactionId: string;
    isProjected: true;
    // Valor da regra; difere de `amount` quando o mês tem um valor previsto ajustado
    ruleAmount: number;
    amountAdjusted: boolean;
}
