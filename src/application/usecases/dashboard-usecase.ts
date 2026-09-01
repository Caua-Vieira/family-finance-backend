import { Inject } from "typescript-ioc";
import { DashboardRepository } from "../../domain/contracts/dashboard-repository";
import { CategoriesRepository } from "../../domain/contracts/categories-repository";
import { DashboardSummaryDTO, CategorySpendingDTO } from "../../domain/types/dashboard-dto";
import { ProjectedTransactionDTO } from "../../domain/types/projected-transaction-dto";
import { RecurringTransactionUseCase } from "./recurring-transaction-usecase";
import { isFutureMonth } from "./utils/month-period";

export class DashboardUseCase {

    constructor(
        @Inject private readonly dashboardRepository: DashboardRepository,
        @Inject private readonly categoriesRepository: CategoriesRepository,
        @Inject private readonly recurringTransactionUseCase: RecurringTransactionUseCase
    ) { }

    async getSummary(householdId: string, month: number, year: number): Promise<DashboardSummaryDTO> {
        const { previousMonth, previousYear } = this.getPreviousPeriod(month, year);

        const [current, previous, categorySpending] = await Promise.all([
            this.dashboardRepository.getMonthlyTotals(householdId, month, year),
            this.dashboardRepository.getMonthlyTotals(householdId, previousMonth, previousYear),
            this.dashboardRepository.getCategorySpending(householdId, month, year),
        ]);

        const isProjection = isFutureMonth({ month, year });

        let income = current.income;
        let expenses = current.expenses;
        let categories = categorySpending;

        if (isProjection) {
            const projected = await this.recurringTransactionUseCase.getProjectedForMonth(householdId, month, year);
            const totals = await this.applyProjection(householdId, categorySpending, projected);
            income += totals.projectedIncome;
            expenses += totals.projectedExpenses;
            categories = totals.categories;
        }

        return {
            month,
            year,
            income,
            expenses,
            balance: income - expenses,
            categories: categories.map((category) => ({
                ...category,
                percentageSpent: this.calculatePercentage(category.spent, category.budgeted),
            })),
            previousMonth: {
                month: previousMonth,
                year: previousYear,
                income: previous.income,
                expenses: previous.expenses,
                expensesVariationPercentage: this.calculatePercentageVariation(expenses, previous.expenses),
            },
            ...(isProjection ? { isProjection: true } : {}),
        };
    }

    private async applyProjection(
        householdId: string,
        categorySpending: CategorySpendingDTO[],
        projected: ProjectedTransactionDTO[]
    ): Promise<{ projectedIncome: number; projectedExpenses: number; categories: CategorySpendingDTO[] }> {
        if (projected.length === 0) {
            return { projectedIncome: 0, projectedExpenses: 0, categories: categorySpending };
        }

        const allCategories = await this.categoriesRepository.findByHouseholdId(householdId);
        const parentById = new Map<number, number | null>();
        allCategories.forEach((category) => {
            parentById.set(Number(category.id), category.parentId === null ? null : Number(category.parentId));
        });

        let projectedIncome = 0;
        let projectedExpenses = 0;
        const extraByMainCategory = new Map<number, number>();

        for (const item of projected) {
            if (item.type === "income") {
                projectedIncome += item.amount;
                continue;
            }

            projectedExpenses += item.amount;

            if (item.categoryId === null) continue;
            const categoryId = Number(item.categoryId);
            const parentId = parentById.get(categoryId);
            const mainCategoryId = parentId == null ? categoryId : parentId;
            extraByMainCategory.set(mainCategoryId, (extraByMainCategory.get(mainCategoryId) ?? 0) + item.amount);
        }

        const categories = categorySpending.map((category) => {
            const extra = extraByMainCategory.get(category.categoryId) ?? 0;
            return extra > 0 ? { ...category, spent: category.spent + extra } : category;
        });

        return { projectedIncome, projectedExpenses, categories };
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
