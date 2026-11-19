import { Inject } from "typescript-ioc";
import { DashboardUseCase } from "./dashboard-usecase";
import { SpendingCapacityDTO } from "../../domain/types/spending-capacity-dto";
import {
    calculateSpendingCapacity,
    parseToday,
    selectPressuredCategories,
} from "./utils/spending-capacity";

// "Hoje" no horário de Brasília — o servidor roda em UTC.
function todayIso(): string {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export class AdvisorUseCase {

    constructor(
        @Inject private readonly dashboardUseCase: DashboardUseCase,
    ) { }

    async getSpendingCapacity(householdId: string, amount?: number): Promise<SpendingCapacityDTO> {
        const today = todayIso();
        const { month, year } = parseToday(today);

        const summary = await this.dashboardUseCase.getSummary(householdId, month, year);

        return calculateSpendingCapacity({
            today,
            income: summary.income,
            expenses: summary.expenses,
            investments: summary.investments,
            amount,
            pressuredCategories: selectPressuredCategories(summary.categories),
        });
    }
}
