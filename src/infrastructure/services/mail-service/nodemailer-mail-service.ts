import nodemailer, { Transporter } from "nodemailer";
import { Singleton } from "typescript-ioc";
import { MailService, WelcomeEmailData } from "../../../domain/contracts/mail-service";
import { buildWelcomeEmailHtml } from "./templates/welcome-email";

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
}
