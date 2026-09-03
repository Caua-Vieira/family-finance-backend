import { StatementEntry } from "../../infrastructure/entities/statement-entry";
import { StatementEntryDTO } from "../types/statement-entry-dto";
import { StatementEntryFiltersDTO } from "../types/statement-entry-filters-dto";

export abstract class StatementEntryRepository {
    abstract create(data: StatementEntryDTO): Promise<StatementEntry>;
    abstract update(data: StatementEntryDTO): Promise<StatementEntry>;
    abstract delete(id: string, householdId: string): Promise<void>;
    abstract findByHouseholdId(householdId: string, filters: StatementEntryFiltersDTO): Promise<StatementEntry[]>;
}
