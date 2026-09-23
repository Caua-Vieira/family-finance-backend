import { Inject } from "typescript-ioc";
import { HouseholdRepository } from "../../domain/contracts/household-repository";
import { MailService } from "../../domain/contracts/mail-service";
import { DashboardUseCase } from "./dashboard-usecase";

export class MonthlyReportUseCase {

    constructor(
        @Inject private readonly householdRepository: HouseholdRepository,
        @Inject private readonly dashboardUseCase: DashboardUseCase,
        @Inject private readonly mailService: MailService,
    ) { }

    async sendForAllHouseholds(month?: number, year?: number): Promise<number> {
        const { targetMonth, targetYear } = this.resolvePeriod(month, year);

        const households = await this.householdRepository.findAllWithUsers();

        let sent = 0;

        for (const household of households) {
            if (household.users.length === 0) continue;

            const summary = await this.dashboardUseCase.getSummary(household.id, targetMonth, targetYear);

            for (const user of household.users) {
                await this.mailService.sendMonthlySummaryEmail({
                    to: user.email,
                    name: user.name,
                    householdName: household.name,
                    summary,
                });
                sent++;
            }
        }

        return sent;
    }

    private resolvePeriod(month?: number, year?: number): { targetMonth: number; targetYear: number } {
        if (month && year) return { targetMonth: month, targetYear: year };

        const now = new Date();
        const currentMonth = now.getUTCMonth() + 1;
        const currentYear = now.getUTCFullYear();

        return currentMonth === 1
            ? { targetMonth: 12, targetYear: currentYear - 1 }
            : { targetMonth: currentMonth - 1, targetYear: currentYear };
    }
}
