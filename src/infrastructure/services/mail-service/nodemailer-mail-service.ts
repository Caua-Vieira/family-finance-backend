import nodemailer, { Transporter } from "nodemailer";
import { Singleton } from "typescript-ioc";
import { MailService, MonthlySummaryEmailData, WelcomeEmailData } from "../../../domain/contracts/mail-service";
import { buildWelcomeEmailHtml } from "./templates/welcome-email";
import { buildMonthlySummaryEmailHtml } from "./templates/monthly-summary-email";

const MONTH_NAMES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

@Singleton
export class NodemailerMailService implements MailService {
    private readonly transporter: Transporter;
    private readonly from: string;

    constructor() {
        this.from = process.env.MAIL_FROM || "Family Finance <no-reply@familyfinance.app>";

        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: process.env.SMTP_USER
                ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
                : undefined,
        });
    }

    async sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
        const subject = data.isHouseholdCreator
            ? `Bem-vindo(a) ao Family Finance, ${data.name}!`
            : `Bem-vindo(a) à família ${data.householdName}, ${data.name}!`;

        try {
            await this.transporter.sendMail({
                from: this.from,
                to: data.to,
                subject,
                html: buildWelcomeEmailHtml(data),
            });
        } catch (err) {
            console.error("Erro ao enviar e-mail de boas-vindas:", err);
        }
    }

    async sendMonthlySummaryEmail(data: MonthlySummaryEmailData): Promise<void> {
        const monthName = MONTH_NAMES[data.summary.month - 1];

        try {
            await this.transporter.sendMail({
                from: this.from,
                to: data.to,
                subject: `Seu resumo financeiro de ${monthName} — ${data.householdName}`,
                html: buildMonthlySummaryEmailHtml(data),
            });
        } catch (err) {
            console.error("Erro ao enviar e-mail de resumo mensal:", err);
        }
    }
}
