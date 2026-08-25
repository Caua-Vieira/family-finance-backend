import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { HouseholdUseCase } from "../../../application/usecases/household-usecase";

@Singleton
export class HouseholdController {

    constructor(
        @Inject private readonly householdUseCase: HouseholdUseCase,
    ) { }

    async get(req: Request, res: Response) {
        const householdId = (req as any).user.householdId;

        const household = await this.householdUseCase.getById(householdId);

        res.status(200).json(household);
    }
}
