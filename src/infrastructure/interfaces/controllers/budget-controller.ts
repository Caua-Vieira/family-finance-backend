import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { BudgetUseCase } from "../../../application/usecases/budget-usecase";
import { BudgetFiltersDTO } from "../../../domain/types/budget-filters-dto";
import { parseNumber } from "./utils/query-parsers";

@Singleton
export class BudgetController {

    constructor(
        @Inject private readonly budgetUseCase: BudgetUseCase,
    ) { }

    async create(req: Request, res: Response) {
        const { categoryId, month, year, estimatedAmount } = req.body;
        const { householdId } = (req as any).user;

        await this.budgetUseCase.create({ categoryId, month, year, estimatedAmount, householdId });

        res.status(201).send();
    }

    async list(req: Request, res: Response) {
        const { householdId } = (req as any).user;
        const { month, year, categoryId } = req.query;

        const filters: BudgetFiltersDTO = {
            month: parseNumber(month),
            year: parseNumber(year),
            categoryId: typeof categoryId === "string" ? categoryId : undefined,
        };

        const budgets = await this.budgetUseCase.list(householdId, filters);

        res.status(200).json(budgets);
    }

    async update(req: Request, res: Response) {
        const id = String(req.params.id);
        const { categoryId, month, year, estimatedAmount } = req.body;
        const { householdId } = (req as any).user;

        await this.budgetUseCase.update({ id, categoryId, month, year, estimatedAmount, householdId });

        res.status(204).send();
    }

    async delete(req: Request, res: Response) {
        const id = String(req.params.id);
        const { householdId } = (req as any).user;

        await this.budgetUseCase.delete(id, householdId);

        res.status(204).send();
    }
}
