import { CategorySpendingDTO, MonthlyTotalsDTO } from "../types/dashboard-dto";

export abstract class DashboardRepository {
    abstract getMonthlyTotals(householdId: string, month: number, year: number): Promise<MonthlyTotalsDTO>;
    abstract getCategorySpending(householdId: string, month: number, year: number): Promise<CategorySpendingDTO[]>;
}
