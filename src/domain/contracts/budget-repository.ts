import { Budget } from "../../infrastructure/entities/budgets";
import { BudgetDTO } from "../types/budget-dto";
import { BudgetFiltersDTO } from "../types/budget-filters-dto";

export abstract class BudgetRepository {
    abstract create(data: BudgetDTO): Promise<void>;
    abstract findByHouseholdId(householdId: string, filters: BudgetFiltersDTO): Promise<Budget[]>;
    abstract update(data: BudgetDTO): Promise<void>;
    abstract delete(id: string, householdId: string): Promise<void>;
}
