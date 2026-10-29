import bcrypt from "bcrypt";
import { Inject } from "typescript-ioc";
import { InvalidRegisterException, NotFoundException, UserAlreadyExistsException } from "../../../domain/errors/errors";
import { generateToken } from "../../../infrastructure/config/jwt";
import { AuthRepository } from "../../../domain/contracts/auth-repository";
import { MailService } from "../../../domain/contracts/mail-service";
import { CreateUserDTO } from "../../../domain/types/create-user-dto";
import { User } from "../../../infrastructure/entities/users";
import { Household } from "../../../infrastructure/entities/household";

export class RegisterUseCase {

    constructor(
        @Inject private readonly authRepository: AuthRepository,
        @Inject private readonly mailService: MailService
    ) { }

    async execute(input: CreateUserDTO) {
        const existing = await this.authRepository.findByEmail(input.email);
        if (existing) {
            throw new UserAlreadyExistsException("E-mail já cadastrado");
        }

        if (!input.password) {
            throw new InvalidRegisterException("Informe uma senha");
        }

        const passwordHash = await bcrypt.hash(input.password, 10);

        return this.createAccount({ ...input, password: passwordHash });
    }

    // Também usado no cadastro pelo Google, onde não há senha. Espera a senha já em hash.
    async createAccount(data: CreateUserDTO) {
        let user: User;
        let household: Household;
        let isHouseholdCreator: boolean;

        if (data.inviteCode) {
            const found = await this.authRepository.findHouseholdByInviteCode(data.inviteCode);
            if (!found) {
                throw new NotFoundException("Código de convite inválido");
            }
            user = await this.authRepository.createUserInExistingHousehold(data, found.id);
            household = found;
            isHouseholdCreator = false;
        } else {
            if (!data.householdName) {
                throw new InvalidRegisterException("Informe o nome da família ou um código de convite");
            }
            const created = await this.authRepository.createUserWithHousehold(data);
            user = created.user;
            household = created.household;
            isHouseholdCreator = true;
        }

        await this.mailService.sendWelcomeEmail({
            to: user.email,
            name: user.name,
            householdName: household.name,
            inviteCode: household.inviteCode,
            isHouseholdCreator,
        });

        return generateToken({ id: user.id, email: user.email, householdId: user.householdId });
    }
}
