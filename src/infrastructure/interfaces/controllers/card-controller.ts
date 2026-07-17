import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { CardUseCase } from "../../../application/usecases/card-usecase";

@Singleton
export class CardController {

    constructor(
        @Inject private readonly cardUseCase: CardUseCase,
    ) { }

    async register(req: Request, res: Response) {
        const { name } = req.body;
        const { id: ownerUserId, householdId } = (req as any).user;

        await this.cardUseCase.create({ name, householdId, ownerUserId });

        res.status(201).send();
    }

    async list(req: Request, res: Response) {
        const householdId = (req as any).user.householdId;

        const cards = await this.cardUseCase.list(householdId);

        res.status(200).json(cards);
    }

    async update(req: Request, res: Response) {
        const id = req.params.id;
        const { name } = req.body;
        const householdId = (req as any).user.householdId;

        await this.cardUseCase.update({ id: Number(id), householdId, name });

        res.status(204).send();
    }

    async delete(req: Request, res: Response) {
        const id = req.params.id;
        const householdId = (req as any).user.householdId;

        await this.cardUseCase.delete(Number(id), householdId);

        res.status(204).send();
    }
}
