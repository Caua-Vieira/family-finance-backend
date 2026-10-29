import { Inject } from "typescript-ioc";
import { MoreThan } from "typeorm";
import { AuthRepository } from "../../../domain/contracts/auth-repository";
import { DatabaseException } from "../../../domain/errors/errors";
import { User } from "../../entities/users";
import { Household } from "../../entities/household";
import { Database } from "../../database/database";
import { CreateUserDTO } from "../../../domain/types/create-user-dto";
import { generateInviteCode } from "../../../utils/generate-invite-code";

export class HttpAuthRepository implements AuthRepository {
    constructor(@Inject private database: Database) { }

    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.database.getRepository(User).findOne({ where: { email } });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao buscar informações");
        }
    }

    async findByValidPasswordResetToken(tokenHash: string): Promise<User | null> {
        try {
            return await this.database.getRepository(User).findOne({
                where: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: MoreThan(new Date()) },
            });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao buscar informações");
        }
    }

    async findHouseholdByInviteCode(inviteCode: string): Promise<Household | null> {
        try {
            return await this.database.getRepository(Household).findOne({ where: { inviteCode } });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao buscar informações");
        }
    }

    async createUserWithHousehold(data: CreateUserDTO): Promise<{ user: User; household: Household }> {
        const queryRunner = this.database.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const household = queryRunner.manager.create(Household, {
                name: data.householdName,
                inviteCode: generateInviteCode(),
            });
            await queryRunner.manager.save(household);

            const user = queryRunner.manager.create(User, {
                name: data.name,
                email: data.email,
                passwordHash: data.password,
                householdId: household.id,
            });
            await queryRunner.manager.save(user);

            await queryRunner.commitTransaction();
            return { user, household };
        } catch {
            await queryRunner.rollbackTransaction();
            throw new DatabaseException("Ocorreu um erro ao criar o usuário");
        } finally {
            await queryRunner.release();
        }
    }

    async createUserInExistingHousehold(data: CreateUserDTO, householdId: string): Promise<User> {
        try {
            const repository = this.database.getRepository(User);
            const user = repository.create({
                name: data.name,
                email: data.email,
                passwordHash: data.password,
                householdId,
            });
            return await repository.save(user);
        } catch {
            throw new DatabaseException("Ocorreu um erro ao criar o usuário");
        }
    }

    async savePasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
        try {
            await this.database.getRepository(User).update(userId, {
                passwordResetTokenHash: tokenHash,
                passwordResetExpiresAt: expiresAt,
            });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao gerar a recuperação de senha");
        }
    }

    async updatePassword(userId: string, passwordHash: string): Promise<void> {
        try {
            // Invalida o link de recuperação junto com a troca, para ele não ser reutilizado
            await this.database.getRepository(User).update(userId, {
                passwordHash,
                passwordResetTokenHash: null,
                passwordResetExpiresAt: null,
            });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao atualizar a senha");
        }
    }
}
