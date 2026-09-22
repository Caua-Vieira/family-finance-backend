import { DashboardSummaryDTO } from "../types/dashboard-dto";

export interface WelcomeEmailData {
    to: string;
    name: string;
    householdName: string;
    inviteCode: string;
    isHouseholdCreator: boolean;
}

export interface MonthlySummaryEmailData {
    to: string;
    name: string;
    householdName: string;
    summary: DashboardSummaryDTO;
}

export abstract class MailService {
    abstract sendWelcomeEmail(data: WelcomeEmailData): Promise<void>;
    abstract sendMonthlySummaryEmail(data: MonthlySummaryEmailData): Promise<void>;
}
