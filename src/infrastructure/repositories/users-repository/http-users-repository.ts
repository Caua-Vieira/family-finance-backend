import { Inject } from "typescript-ioc";
import { UsersRepository } from "../../../domain/contracts/users-repository";
import { DatabaseException } from "../../../domain/errors/errors";
import { User } from "../../entities/users";
import { Database } from "../../database/database";

export class HttpUsersRepository implements UsersRepository {
    constructor(@Inject private database: Database) { }

    async findByHouseholdId(householdId: string): Promise<Pick<User, "id" | "name">[]> {
        try {
            return await this.database.getRepository(User).find({
                where: { householdId },
                select: { id: true, name: true },
            });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao buscar os membros da família");
        }
    }
}
