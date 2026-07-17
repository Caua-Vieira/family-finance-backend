import { Card } from "../../infrastructure/entities/card";
import { CreateCardDTO } from "../types/create-card-dto";
import { UpdateCardDTO } from "../types/update-card-dto";

export abstract class CardRepository {
    abstract create(data: CreateCardDTO): Promise<void>;
    abstract findByHouseholdId(householdId: string): Promise<Card[]>;
    abstract update(data: UpdateCardDTO): Promise<void>;
    abstract delete(id: number, householdId: string): Promise<void>;
}
