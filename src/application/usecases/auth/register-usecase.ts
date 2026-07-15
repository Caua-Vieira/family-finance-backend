import bcrypt from "bcrypt";
import { Inject } from "typescript-ioc";
import { UserAlreadyExistsException } from "../../../domain/errors/errors";
import { generateToken } from "../../../infrastructure/config/jwt";
import { AuthRepository } from "../../../domain/contracts/auth-repository";
import { CreateUserDTO } from "../../../domain/types/create-user-dto";

export class RegisterUseCase {

    constructor(
        @Inject private readonly authRepository: AuthRepository
    ) { }

    async execute(input: CreateUserDTO) {
        const existing = await this.authRepository.findByEmail(input.email);
        if (existing) {
            throw new UserAlreadyExistsException("E-mail já cadastrado");
        }

        const passwordHash = await bcrypt.hash(input.password, 10);

        const user = await this.authRepository.createUserWithHousehold({
            ...input,
            password: passwordHash,
            householdName: input.householdName ?? `Família ${input.name}`,
        });

        return generateToken({ id: user.id, email: user.email, householdId: user.householdId });
    }
}
