import { Inject } from "typescript-ioc";
import { StatementEntryRepository } from "../../domain/contracts/statement-entry-repository";
import { StatementEntryDTO } from "../../domain/types/statement-entry-dto";
import { StatementEntryFiltersDTO } from "../../domain/types/statement-entry-filters-dto";
import { StatementEntry } from "../../infrastructure/entities/statement-entry";

export class StatementEntryUseCase {

    constructor(
        @Inject private readonly statementEntryRepository: StatementEntryRepository
    ) { }

    async create(input: StatementEntryDTO): Promise<StatementEntry> {
        return this.statementEntryRepository.create(input);
    }

    async update(input: StatementEntryDTO): Promise<StatementEntry> {
        return this.statementEntryRepository.update(input);
    }

    async delete(id: string, householdId: string): Promise<void> {
        await this.statementEntryRepository.delete(id, householdId);
    }

    async list(householdId: string, filters: StatementEntryFiltersDTO): Promise<StatementEntry[]> {
        return this.statementEntryRepository.findByHouseholdId(householdId, filters);
    }
}
