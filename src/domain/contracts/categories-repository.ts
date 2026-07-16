import { Category } from "../../infrastructure/entities/categories";
import { CreateCategoriesDTO } from "../types/create-categories-dto";

export abstract class CategoriesRepository {
    abstract create(data: CreateCategoriesDTO): Promise<void>;
    abstract findByHouseholdId(householdId: string): Promise<Category[]>;
    abstract delete(id: string, householdId: string): Promise<void>;
}
