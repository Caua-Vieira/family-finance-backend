import { Investment } from "../../infrastructure/entities/investment";
import { InvestmentDTO } from "../types/investment-dto";

export abstract class InvestmentRepository {
    abstract create(data: InvestmentDTO): Promise<Investment>;
    abstract update(data: InvestmentDTO): Promise<Investment>;
    abstract delete(id: string, householdId: string): Promise<void>;
    abstract findByHouseholdId(householdId: string): Promise<Investment[]>;
}
