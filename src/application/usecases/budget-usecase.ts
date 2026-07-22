import { Inject } from "typescript-ioc";
import { BudgetRepository } from "../../domain/contracts/budget-repository";
import { CategoriesRepository } from "../../domain/contracts/categories-repository";
import { InvalidCategoryException } from "../../domain/errors/errors";
import { BudgetDTO } from "../../domain/types/budget-dto";
import { BudgetFiltersDTO } from "../../domain/types/budget-filters-dto";
import { Budget } from "../../infrastructure/entities/budgets";

export class BudgetUseCase {

    constructor(
        @Inject private readonly budgetRepository: BudgetRepository,
        @Inject private readonly categoriesRepository: CategoriesRepository
    ) { }

    async create(input: BudgetDTO): Promise<void> {
        await this.ensureMainCategory(input.categoryId, input.householdId);
        await this.budgetRepository.create(input);
    }

    async list(householdId: string, filters: BudgetFiltersDTO): Promise<Budget[]> {
        return this.budgetRepository.findByHouseholdId(householdId, filters);
    }

    async update(input: BudgetDTO): Promise<void> {
        await this.ensureMainCategory(input.categoryId, input.householdId);
        await this.budgetRepository.update(input);
    }

    async delete(id: string, householdId: string): Promise<void> {
        await this.budgetRepository.delete(id, householdId);
    }

    private async ensureMainCategory(categoryId: string, householdId: string): Promise<void> {
        const category = await this.categoriesRepository.findById(Number(categoryId), householdId);

        if (!category || category.parentId !== null) {
            throw new InvalidCategoryException("O orçamento deve ser vinculado a uma categoria principal");
        }
    }
}
