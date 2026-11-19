export type SpendingVerdict = "ok" | "tight" | "no";

export interface PressuredCategoryDTO {
    categoryName: string;
    budgeted: number;
    spent: number;
    percentageSpent: number;
}

export interface SpendingQuestionDTO {
    amount: number;
    balanceAfter: number;
    verdict: SpendingVerdict;
    message: string;
}

export interface SpendingCapacityDTO {
    today: string;
    month: number;
    year: number;
    income: number;
    // Despesas totais do mês (despesas + investimentos)
    expenses: number;
    investments: number;
    // Saldo restante do mês: receitas - despesas totais
    balance: number;
    // Dias que faltam no mês, contando hoje
    daysLeft: number;
    // Quanto dá para gastar por dia até o fim do mês sem estourar o saldo
    dailyAllowance: number;
    // Duas diárias (sábado e domingo)
    weekendAllowance: number;
    // Folga de segurança: 10% da renda do mês
    safetyMargin: number;
    incomeRegistered: boolean;
    // Categorias com orçamento já em 90% ou mais
    pressuredCategories: PressuredCategoryDTO[];
    // Presente quando foi perguntado se um valor cabe
    question?: SpendingQuestionDTO;
    // Se o assistente de IA (chat) está configurado
    chatEnabled?: boolean;
}
