import { Inject } from "typescript-ioc";
import { CardRepository } from "../../../domain/contracts/card-repository";
import { DatabaseException, NotFoundException } from "../../../domain/errors/errors";
import { Card } from "../../entities/card";
import { Database } from "../../database/database";
import { CreateCardDTO } from "../../../domain/types/create-card-dto";
import { UpdateCardDTO } from "../../../domain/types/update-card-dto";

export class HttpCardRepository implements CardRepository {
    constructor(@Inject private database: Database) { }

    async create(data: CreateCardDTO): Promise<void> {
        try {
            const repository = this.database.getRepository(Card);
            const card = repository.create(data);
            await repository.save(card);
        } catch (error) {
            throw new DatabaseException("Ocorreu um erro ao registrar o cartão");
        }
    }

    async findByHouseholdId(householdId: string): Promise<Card[]> {
        try {
            return await this.database.getRepository(Card).find({ where: { householdId } });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao buscar os cartões");
        }
    }

    async update(data: UpdateCardDTO): Promise<void> {
        const { id, householdId, ...rest } = data;

        let result;
        try {
            result = await this.database.getRepository(Card).update({ id, householdId }, rest);
        } catch {
            throw new DatabaseException("Ocorreu um erro ao atualizar o cartão");
        }

        if (!result.affected) {
            throw new NotFoundException("Cartão não encontrado");
        }
    }

    async delete(id: number, householdId: string): Promise<void> {
        let result;
        try {
            result = await this.database.getRepository(Card).delete({ id, householdId });
        } catch {
            throw new DatabaseException("Ocorreu um erro ao excluir o cartão");
        }

        if (!result.affected) {
            throw new NotFoundException("Cartão não encontrado");
        }
    }
}
