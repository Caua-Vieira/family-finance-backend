import { Inject } from "typescript-ioc";
import { AuthRepository } from "../../../domain/contracts/auth-repository";
import { DatabaseException } from "../../../domain/errors/errors";
import { User } from "../../entities/users";
import { Household } from "../../entities/household";
import { Database } from "../../database/database";
import { CreateUserDTO } from "../../../domain/types/create-user-dto";

export class HttpAuthRepository implements AuthRepository {
    constructor(@Inject private database: Database) { }

    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.database.getRepository(User).findOne({ where: { email } });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao buscar informações");
        }
    }

    async createUserWithHousehold(data: CreateUserDTO): Promise<User> {
        const queryRunner = this.database.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const household = queryRunner.manager.create(Household, {
                name: data.householdName,
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
            return user;
        } catch {
            await queryRunner.rollbackTransaction();
            throw new DatabaseException("Ocorreu um erro ao criar o usuário");
        } finally {
            await queryRunner.release();
        }
    }
}
