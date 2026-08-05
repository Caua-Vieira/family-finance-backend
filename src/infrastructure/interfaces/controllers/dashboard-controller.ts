import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { DashboardUseCase } from "../../../application/usecases/dashboard-usecase";
import { parseNumber } from "./utils/query-parsers";

@Singleton
export class DashboardController {

    constructor(
        @Inject private readonly dashboardUseCase: DashboardUseCase,
    ) { }

    async getSummary(req: Request, res: Response) {
        const { householdId } = (req as any).user;
        const { month, year } = req.query;

        const now = new Date();
        const resolvedMonth = parseNumber(month) ?? now.getMonth() + 1;
        const resolvedYear = parseNumber(year) ?? now.getFullYear();

        const summary = await this.dashboardUseCase.getSummary(householdId, resolvedMonth, resolvedYear);

        res.status(200).json(summary);
    }
}
