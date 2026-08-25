import { Inject } from "typescript-ioc";
import { HouseholdRepository } from "../../../domain/contracts/household-repository";
import { DatabaseException } from "../../../domain/errors/errors";
import { Household } from "../../entities/household";
import { Database } from "../../database/database";

export class HttpHouseholdRepository implements HouseholdRepository {
    constructor(@Inject private database: Database) { }

    async findById(id: string): Promise<Household | null> {
        try {
            return await this.database.getRepository(Household).findOne({ where: { id } });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao buscar informações da família");
        }
    }
}
