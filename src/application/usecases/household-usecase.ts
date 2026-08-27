import { Inject } from "typescript-ioc";
import { HouseholdRepository } from "../../domain/contracts/household-repository";
import { NotFoundException } from "../../domain/errors/errors";

export class HouseholdUseCase {

    constructor(
        @Inject private readonly householdRepository: HouseholdRepository
    ) { }

    async getById(householdId: string) {
        const household = await this.householdRepository.findById(householdId);
        if (!household) {
            throw new NotFoundException("Família não encontrada");
        }

        return {
            id: household.id,
            name: household.name,
            currency: household.currency,
            inviteCode: household.inviteCode,
        };
    }
}
