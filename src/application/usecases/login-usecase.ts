import bcrypt from "bcrypt";
import { Inject } from "typescript-ioc";
import { InvalidCredentialsException } from "../../domain/errors/errors";
import { generateToken } from "../../infrastructure/config/jwt";
import { AuthRepository } from "../../domain/contracts/auth-repository";

export class LoginUseCase {

    constructor(
        @Inject private readonly authRepository: AuthRepository
    ) { }

    async execute(email: string, password: string) {
        const user = await this.authRepository.findByEmail(email);
        if (!user) {
            throw new InvalidCredentialsException("Credenciais inválidas");
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new InvalidCredentialsException("Credenciais inválidas");
        }

        return generateToken({ id: user.id, email: user.email });
    }
}
