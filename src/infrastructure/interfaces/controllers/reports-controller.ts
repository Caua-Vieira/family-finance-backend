import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { MonthlyReportUseCase } from "../../../application/usecases/monthly-report-usecase";

@Singleton
export class ReportsController {

    constructor(
        @Inject private readonly monthlyReportUseCase: MonthlyReportUseCase,
    ) { }

    async sendMonthlySummary(req: Request, res: Response) {
        const month = this.parseMonthOrYear(req.body.month);
        const year = this.parseMonthOrYear(req.body.year);

        const sent = await this.monthlyReportUseCase.sendForAllHouseholds(month, year);

        res.status(200).json({ sent });
    }

    private parseMonthOrYear(value: unknown): number | undefined {
        if (value === undefined || value === null) return undefined;
        const number = Number(value);
        return Number.isInteger(number) ? number : undefined;
    }
}
