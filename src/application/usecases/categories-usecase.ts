import { Inject } from "typescript-ioc";
import { CategoriesRepository } from "../../domain/contracts/categories-repository";
import { CreateCategoriesDTO } from "../../domain/types/create-categories-dto";

export class CategoriesUseCase {

    constructor(
        @Inject private readonly categoriesRepository: CategoriesRepository
    ) { }

    async create(input: CreateCategoriesDTO): Promise<void> {
        await this.categoriesRepository.create(input);
    }

    async list(householdId: string) {
        return this.categoriesRepository.findByHouseholdId(householdId);
    }

    async delete(id: string, householdId: string): Promise<void> {
        await this.categoriesRepository.delete(id, householdId);
    }
}
