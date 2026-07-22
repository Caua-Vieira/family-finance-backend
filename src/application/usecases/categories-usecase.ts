import { Inject } from "typescript-ioc";
import { CategoriesRepository } from "../../domain/contracts/categories-repository";
import { CategoryDTO } from "../../domain/types/category-dto";

export class CategoriesUseCase {

    constructor(
        @Inject private readonly categoriesRepository: CategoriesRepository
    ) { }

    async create(input: CategoryDTO): Promise<void> {
        await this.categoriesRepository.create(input);
    }

    async list(householdId: string) {
        return this.categoriesRepository.findByHouseholdId(householdId);
    }

    async update(input: CategoryDTO): Promise<void> {
        await this.categoriesRepository.update(input);
    }

    async delete(id: number, householdId: string): Promise<void> {
        await this.categoriesRepository.delete(id, householdId);
    }
}
