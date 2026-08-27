import { Household } from "../../infrastructure/entities/household";

export abstract class HouseholdRepository {
    abstract findById(id: string): Promise<Household | null>;
}
