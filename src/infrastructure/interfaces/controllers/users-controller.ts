import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { UsersUseCase } from "../../../application/usecases/users-usecase";

@Singleton
export class UsersController {

    constructor(
        @Inject private readonly usersUseCase: UsersUseCase,
    ) { }

    async list(req: Request, res: Response) {
        const householdId = (req as any).user.householdId;

        const users = await this.usersUseCase.list(householdId);

        res.status(200).json(users);
    }
}
