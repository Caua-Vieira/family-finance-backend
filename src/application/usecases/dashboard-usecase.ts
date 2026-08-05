import { Inject } from "typescript-ioc";
import { DashboardRepository } from "../../domain/contracts/dashboard-repository";
import { DashboardSummaryDTO } from "../../domain/types/dashboard-dto";

export class DashboardUseCase {

    constructor(
        @Inject private readonly dashboardRepository: DashboardRepository
    ) { }

    async getSummary(householdId: string, month: number, year: number): Promise<DashboardSummaryDTO> {
        const { previousMonth, previousYear } = this.getPreviousPeriod(month, year);

        const [current, previous, categorySpending] = await Promise.all([
            this.dashboardRepository.getMonthlyTotals(householdId, month, year),
            this.dashboardRepository.getMonthlyTotals(householdId, previousMonth, previousYear),
            this.dashboardRepository.getCategorySpending(householdId, month, year),
        ]);

        return {
            month,
            year,
            income: current.income,
            expenses: current.expenses,
            balance: current.income - current.expenses,
            categories: categorySpending.map((category) => ({
                ...category,
                percentageSpent: this.calculatePercentage(category.spent, category.budgeted),
            })),
            previousMonth: {
                month: previousMonth,
                year: previousYear,
                income: previous.income,
                expenses: previous.expenses,
                expensesVariationPercentage: this.calculatePercentageVariation(current.expenses, previous.expenses),
            },
        };
    }

    private getPreviousPeriod(month: number, year: number): { previousMonth: number; previousYear: number } {
        return month === 1
            ? { previousMonth: 12, previousYear: year - 1 }
            : { previousMonth: month - 1, previousYear: year };
    }

    private calculatePercentage(spent: number, budgeted: number): number | null {
        if (budgeted === 0) return spent === 0 ? 0 : null;
        return this.round(((spent / budgeted) * 100));
    }

    private calculatePercentageVariation(current: number, previous: number): number | null {
        if (previous === 0) return current === 0 ? 0 : null;
        return this.round((((current - previous) / previous) * 100));
    }

    private round(value: number): number {
        return Math.round(value * 100) / 100;
    }
}
