import { Request, Response } from "express";
import { Inject, Singleton } from "typescript-ioc";
import { LoginUseCase } from "../../../application/usecases/auth/login-usecase";
import { RegisterUseCase } from "../../../application/usecases/auth/register-usecase";
import { PasswordResetUseCase } from "../../../application/usecases/auth/password-reset-usecase";

@Singleton
export class AuthController {

    constructor(
        @Inject private readonly loginUseCase: LoginUseCase,
        @Inject private readonly registerUseCase: RegisterUseCase,
        @Inject private readonly passwordResetUseCase: PasswordResetUseCase,
    ) { }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        const token = await this.loginUseCase.execute(email, password);

        res.json({ token });
    }

    async register(req: Request, res: Response) {
        const { name, email, password, householdName, inviteCode } = req.body;

        const token = await this.registerUseCase.execute({ name, email, password, householdName, inviteCode });

        res.status(201).json({ token });
    }

    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;

        await this.passwordResetUseCase.requestReset(email);

        res.status(204).send();
    }

    async resetPassword(req: Request, res: Response) {
        const { token: resetToken, password } = req.body;

        const token = await this.passwordResetUseCase.resetPassword(resetToken, password);

        res.json({ token });
    }
}
