import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { AdvisorUseCase } from "../../../application/usecases/advisor-usecase";
import { AdvisorChatUseCase } from "../../../application/usecases/advisor-chat-usecase";
import { parseNumber } from "./utils/query-parsers";

@Singleton
export class AdvisorController {

    constructor(
        @Inject private readonly advisorUseCase: AdvisorUseCase,
        @Inject private readonly advisorChatUseCase: AdvisorChatUseCase,
    ) { }

    async getSpendingCapacity(req: Request, res: Response) {
        const { householdId } = (req as any).user;
        const amount = parseNumber(req.query.amount);

        const capacity = await this.advisorUseCase.getSpendingCapacity(householdId, amount);

        res.status(200).json({ ...capacity, chatEnabled: this.advisorChatUseCase.isEnabled() });
    }

    async chat(req: Request, res: Response) {
        const { householdId } = (req as any).user;

        const reply = await this.advisorChatUseCase.chat(householdId, req.body?.messages);

        res.status(200).json({ reply });
    }
}
