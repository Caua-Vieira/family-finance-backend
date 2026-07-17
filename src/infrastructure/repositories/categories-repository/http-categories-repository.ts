import { Inject } from "typescript-ioc";
import { CategoriesRepository } from "../../../domain/contracts/categories-repository";
import { DatabaseException, NotFoundException } from "../../../domain/errors/errors";
import { Category } from "../../entities/categories";
import { Database } from "../../database/database";
import { CreateCategoriesDTO } from "../../../domain/types/create-categories-dto";

export class HttpCategoriesRepository implements CategoriesRepository {
    constructor(@Inject private database: Database) { }

    async create(data: CreateCategoriesDTO): Promise<void> {
        try {
            const repository = this.database.getRepository(Category);
            const category = repository.create(data);
            await repository.save(category);
        } catch (error) {
            console.log(error)
            throw new DatabaseException("Ocorreu um erro ao criar a categoria");
        }
    }

    async findByHouseholdId(householdId: string): Promise<Category[]> {
        try {
            return await this.database.getRepository(Category).find({ where: { householdId } });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao buscar as categorias");
        }
    }

    async delete(id: number, householdId: string): Promise<void> {
        let result;
        try {
            result = await this.database.getRepository(Category).delete({ id, householdId });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao excluir a categoria");
        }

        if (!result.affected) {
            throw new NotFoundException("Categoria não encontrada");
        }
    }
}
