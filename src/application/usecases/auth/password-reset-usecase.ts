import bcrypt from "bcrypt";
import crypto from "crypto";
import { Inject } from "typescript-ioc";
import { InvalidRegisterException, InvalidTokenException } from "../../../domain/errors/errors";
import { generateToken } from "../../../infrastructure/config/jwt";
import { AuthRepository } from "../../../domain/contracts/auth-repository";
import { MailService } from "../../../domain/contracts/mail-service";

const RESET_TOKEN_TTL_MINUTES = 60;
const MIN_PASSWORD_LENGTH = 6;

// Só o hash do token fica no banco: um vazamento da tabela não permite redefinir senhas.
function hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export class PasswordResetUseCase {

    constructor(
        @Inject private readonly authRepository: AuthRepository,
        @Inject private readonly mailService: MailService,
    ) { }

    async requestReset(email: string) {
        // Responde igual exista ou não a conta, para não revelar quais e-mails estão cadastrados.
        const user = await this.authRepository.findByEmail(email);
        if (!user) return;

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
        await this.authRepository.savePasswordResetToken(user.id, hashToken(token), expiresAt);

        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

        await this.mailService.sendPasswordResetEmail({
            to: user.email,
            name: user.name,
            resetUrl: `${frontendUrl}/redefinir-senha?token=${token}`,
            expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
        });
    }

    async resetPassword(token: string, password: string) {
        if (!password || password.length < MIN_PASSWORD_LENGTH) {
            throw new InvalidRegisterException(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`);
        }

        const user = token ? await this.authRepository.findByValidPasswordResetToken(hashToken(token)) : null;
        if (!user) {
            throw new InvalidTokenException("Link inválido ou expirado. Peça uma nova recuperação de senha.");
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await this.authRepository.updatePassword(user.id, passwordHash);

        return generateToken({ id: user.id, email: user.email, householdId: user.householdId });
    }
}
