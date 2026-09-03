import { Inject } from "typescript-ioc";
import { StatementEntryRepository } from "../../../domain/contracts/statement-entry-repository";
import { DatabaseException, NotFoundException } from "../../../domain/errors/errors";
import { StatementEntry } from "../../entities/statement-entry";
import { Database } from "../../database/database";
import { StatementEntryDTO } from "../../../domain/types/statement-entry-dto";
import { StatementEntryFiltersDTO } from "../../../domain/types/statement-entry-filters-dto";

export class HttpStatementEntryRepository implements StatementEntryRepository {
    constructor(@Inject private database: Database) { }

    async create(data: StatementEntryDTO): Promise<StatementEntry> {
        try {
            const repository = this.database.getRepository(StatementEntry);
            const entry = repository.create(data);
            return await repository.save(entry);
        } catch (error) {
            console.error("StatementEntry.create:", error);
            throw new DatabaseException("Ocorreu um erro ao registrar o item do extrato");
        }
    }

    async update(data: StatementEntryDTO): Promise<StatementEntry> {
        const { id, householdId, ...rest } = data;

        let result;
        try {
            result = await this.database.getRepository(StatementEntry).update({ id, householdId }, rest);
        } catch (error) {
            console.error("StatementEntry.update:", error);
            throw new DatabaseException("Ocorreu um erro ao atualizar o item do extrato");
        }

        if (!result.affected) {
            throw new NotFoundException("Item do extrato não encontrado");
        }

        return await this.findByIdOrFail(id!, householdId);
    }

    async delete(id: string, householdId: string): Promise<void> {
        let result;
        try {
            result = await this.database.getRepository(StatementEntry).delete({ id, householdId });
        } catch (error) {
            console.error("StatementEntry.delete:", error);
            throw new DatabaseException("Ocorreu um erro ao excluir o item do extrato");
        }

        if (!result.affected) {
            throw new NotFoundException("Item do extrato não encontrado");
        }
    }

    async findByHouseholdId(householdId: string, filters: StatementEntryFiltersDTO): Promise<StatementEntry[]> {
        try {
            const query = this.database.getRepository(StatementEntry)
                .createQueryBuilder("entry")
                .where("entry.householdId = :householdId", { householdId });

            if (filters.cardId !== undefined) {
                query.andWhere("entry.cardId = :cardId", { cardId: filters.cardId });
            }
            if (filters.startDate !== undefined) {
                query.andWhere("entry.date >= :startDate", { startDate: filters.startDate });
            }
            if (filters.endDate !== undefined) {
                query.andWhere("entry.date <= :endDate", { endDate: filters.endDate });
            }

            return await query.orderBy("entry.date", "DESC").addOrderBy("entry.createdAt", "DESC").getMany();
        } catch (error) {
            console.error("StatementEntry.findByHouseholdId:", error);
            throw new DatabaseException("Ocorreu um erro ao buscar os itens do extrato");
        }
    }

    private async findByIdOrFail(id: string, householdId: string): Promise<StatementEntry> {
        let entry;
        try {
            entry = await this.database.getRepository(StatementEntry).findOne({ where: { id, householdId } });
        } catch (error) {
            console.error("StatementEntry.findByIdOrFail:", error);
            throw new DatabaseException("Ocorreu um erro ao buscar o item do extrato");
        }

        if (!entry) {
            throw new NotFoundException("Item do extrato não encontrado");
        }

        return entry;
    }
}
