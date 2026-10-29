import { OAuth2Client } from "google-auth-library";
import { Inject } from "typescript-ioc";
import { HouseholdRequiredException, InvalidCredentialsException } from "../../../domain/errors/errors";
import { generateToken } from "../../../infrastructure/config/jwt";
import { AuthRepository } from "../../../domain/contracts/auth-repository";
import { RegisterUseCase } from "./register-usecase";

export interface GoogleLoginInput {
    credential: string;
    householdName?: string;
    inviteCode?: string;
}

export class GoogleLoginUseCase {
    private readonly googleClient = new OAuth2Client();

    constructor(
        @Inject private readonly authRepository: AuthRepository,
        @Inject private readonly registerUseCase: RegisterUseCase,
    ) { }

    async execute(input: GoogleLoginInput) {
        const profile = await this.verifyCredential(input.credential);

        const byGoogleId = await this.authRepository.findByGoogleId(profile.googleId);
        if (byGoogleId) {
            return generateToken({ id: byGoogleId.id, email: byGoogleId.email, householdId: byGoogleId.householdId });
        }

        // Conta já cadastrada com o mesmo e-mail: o Google confirmou o e-mail, então vinculamos.
        const byEmail = await this.authRepository.findByEmail(profile.email);
        if (byEmail) {
            await this.authRepository.linkGoogleAccount(byEmail.id, profile.googleId);
            return generateToken({ id: byEmail.id, email: byEmail.email, householdId: byEmail.householdId });
        }

        if (!input.householdName && !input.inviteCode) {
            throw new HouseholdRequiredException("Informe o nome da família ou um código de convite para concluir o cadastro");
        }

        return this.registerUseCase.createAccount({
            name: profile.name,
            email: profile.email,
            googleId: profile.googleId,
            householdName: input.householdName,
            inviteCode: input.inviteCode,
        });
    }

    private async verifyCredential(credential: string) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new Error("GOOGLE_CLIENT_ID não configurado");
        }

        let payload;
        try {
            const ticket = await this.googleClient.verifyIdToken({ idToken: credential, audience: clientId });
            payload = ticket.getPayload();
        } catch {
            throw new InvalidCredentialsException("Não foi possível validar o login com o Google");
        }

        if (!payload?.sub || !payload.email || !payload.email_verified) {
            throw new InvalidCredentialsException("A conta Google precisa ter um e-mail verificado");
        }

        return {
            googleId: payload.sub,
            email: payload.email.toLowerCase(),
            name: payload.name || payload.email.split("@")[0],
        };
    }
}
