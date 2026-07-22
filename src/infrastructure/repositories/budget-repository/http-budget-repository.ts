import { Inject } from "typescript-ioc";
import { BudgetRepository } from "../../../domain/contracts/budget-repository";
import { DatabaseException, NotFoundException } from "../../../domain/errors/errors";
import { Budget } from "../../entities/budgets";
import { Database } from "../../database/database";
import { BudgetDTO } from "../../../domain/types/budget-dto";
import { BudgetFiltersDTO } from "../../../domain/types/budget-filters-dto";

export class HttpBudgetRepository implements BudgetRepository {
    constructor(@Inject private database: Database) { }

    async create(data: BudgetDTO): Promise<void> {
        try {
            const repository = this.database.getRepository(Budget);
            const budget = repository.create(data);
            await repository.save(budget);
        } catch (error) {
            throw new DatabaseException("Ocorreu um erro ao criar o orçamento");
        }
    }

    async findByHouseholdId(householdId: string, filters: BudgetFiltersDTO): Promise<Budget[]> {
        try {
            const repository = this.database.getRepository(Budget);
            const query = repository.createQueryBuilder("budget")
                .where("budget.householdId = :householdId", { householdId });

            this.buildFilterConditions(filters).forEach(({ clause, params }) => query.andWhere(clause, params));

            query.orderBy("budget.year", "DESC").addOrderBy("budget.month", "DESC");

            return await query.getMany();
        } catch (error) {
            throw new DatabaseException("Ocorreu um erro ao buscar os orçamentos");
        }
    }

    async update(data: BudgetDTO): Promise<void> {
        const { id, householdId, ...rest } = data;

        let result;
        try {
            result = await this.database.getRepository(Budget).update({ id, householdId }, rest);
        } catch {
            throw new DatabaseException("Ocorreu um erro ao atualizar o orçamento");
        }

        if (!result.affected) {
            throw new NotFoundException("Orçamento não encontrado");
        }
    }

    async delete(id: string, householdId: string): Promise<void> {
        let result;
        try {
            result = await this.database.getRepository(Budget).delete({ id, householdId });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao excluir o orçamento");
        }

        if (!result.affected) {
            throw new NotFoundException("Orçamento não encontrado");
        }
    }

    private buildFilterConditions(filters: BudgetFiltersDTO): { clause: string; params: Record<string, unknown> }[] {
        const conditions: [unknown, string, Record<string, unknown>][] = [
            [filters.month, "budget.month = :month", { month: filters.month }],
            [filters.year, "budget.year = :year", { year: filters.year }],
            [filters.categoryId, "budget.categoryId = :categoryId", { categoryId: filters.categoryId }],
        ];

        return conditions
            .filter(([value]) => value !== undefined)
            .map(([, clause, params]) => ({ clause, params }));
    }
}
