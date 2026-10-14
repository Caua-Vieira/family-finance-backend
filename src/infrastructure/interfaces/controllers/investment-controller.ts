import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { InvestmentUseCase } from "../../../application/usecases/investment-usecase";
import { InvestmentDTO } from "../../../domain/types/investment-dto";

@Singleton
export class InvestmentController {

    constructor(
        @Inject private readonly investmentUseCase: InvestmentUseCase,
    ) { }

    async list(req: Request, res: Response) {
        const { householdId } = (req as any).user;

        const investments = await this.investmentUseCase.list(householdId);

        res.status(200).json(investments);
    }

    async create(req: Request, res: Response) {
        const { householdId } = (req as any).user;

        const investment = await this.investmentUseCase.create(this.parseBody(req, householdId));

        res.status(201).json(investment);
    }

    async update(req: Request, res: Response) {
        const id = String(req.params.id);
        const { householdId } = (req as any).user;

        const investment = await this.investmentUseCase.update({ ...this.parseBody(req, householdId), id });

        res.status(200).json(investment);
    }

    async delete(req: Request, res: Response) {
        const id = String(req.params.id);
        const { householdId } = (req as any).user;

        await this.investmentUseCase.delete(id, householdId);

        res.status(204).send();
    }

    private parseBody(req: Request, householdId: string): InvestmentDTO {
        const { name, type, institution, investedAmount, currentValue } = req.body;

        return {
            householdId,
            name: typeof name === "string" ? name.trim() : "",
            type,
            institution: typeof institution === "string" && institution.trim() !== "" ? institution.trim() : null,
            investedAmount: Number(investedAmount),
            currentValue: Number(currentValue),
        };
    }
}
