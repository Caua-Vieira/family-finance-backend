import { Inject } from "typescript-ioc";
import { CardRepository } from "../../domain/contracts/card-repository";
import { CreateCardDTO } from "../../domain/types/create-card-dto";
import { UpdateCardDTO } from "../../domain/types/update-card-dto";

export class CardUseCase {

    constructor(
        @Inject private readonly cardRepository: CardRepository
    ) { }

    async create(input: CreateCardDTO): Promise<void> {
        await this.cardRepository.create(input);
    }

    async list(householdId: string) {
        return this.cardRepository.findByHouseholdId(householdId);
    }

    async update(input: UpdateCardDTO): Promise<void> {
        await this.cardRepository.update(input);
    }

    async delete(id: number, householdId: string): Promise<void> {
        await this.cardRepository.delete(id, householdId);
    }
}
