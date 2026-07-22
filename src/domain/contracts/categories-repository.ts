import { Category } from "../../infrastructure/entities/categories";
import { CategoryDTO } from "../types/category-dto";

export abstract class CategoriesRepository {
    abstract create(data: CategoryDTO): Promise<void>;
    abstract findByHouseholdId(householdId: string): Promise<Category[]>;
    abstract update(data: CategoryDTO): Promise<void>;
    abstract delete(id: number, householdId: string): Promise<void>;
}
