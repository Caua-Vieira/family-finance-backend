import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { CategoriesUseCase } from "../../../application/usecases/categories-usecase";

@Singleton
export class CategoriesController {

    constructor(
        @Inject private readonly categoriesUseCase: CategoriesUseCase,
    ) { }

    async create(req: Request, res: Response) {
        const { name, parentId } = req.body;
        const householdId = (req as any).user.householdId;

        await this.categoriesUseCase.create({ name, parentId, householdId });

        res.status(204).send();
    }

    async list(req: Request, res: Response) {
        const householdId = (req as any).user.householdId;

        const categories = await this.categoriesUseCase.list(householdId);

        res.status(200).json(categories);
    }

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        const { name, parentId } = req.body;
        const householdId = (req as any).user.householdId;

        await this.categoriesUseCase.update({ id, name, parentId, householdId });

        res.status(204).send();
    }

    async delete(req: Request, res: Response) {
        const id = Number(req.params.id);
        const householdId = (req as any).user.householdId;

        await this.categoriesUseCase.delete(id, householdId);

        res.status(204).send();
    }
}
