import { Inject } from "typescript-ioc";
import { UsersRepository } from "../../domain/contracts/users-repository";

export class UsersUseCase {

    constructor(
        @Inject private readonly usersRepository: UsersRepository
    ) { }

    async list(householdId: string) {
        return this.usersRepository.findByHouseholdId(householdId);
    }
}
