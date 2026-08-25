import bcrypt from "bcrypt";
import { Inject } from "typescript-ioc";
import { InvalidRegisterException, NotFoundException, UserAlreadyExistsException } from "../../../domain/errors/errors";
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
        const data: CreateUserDTO = { ...input, password: passwordHash };

        let user;
        if (input.inviteCode) {
            const household = await this.authRepository.findHouseholdByInviteCode(input.inviteCode);
            if (!household) {
                throw new NotFoundException("Código de convite inválido");
            }
            user = await this.authRepository.createUserInExistingHousehold(data, household.id);
        } else {
            if (!input.householdName) {
                throw new InvalidRegisterException("Informe o nome da família ou um código de convite");
            }
            user = await this.authRepository.createUserWithHousehold(data);
        }

        return generateToken({ id: user.id, email: user.email, householdId: user.householdId });
    }
}
