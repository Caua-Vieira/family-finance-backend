import { User } from "../../infrastructure/entities/users";

export abstract class UsersRepository {
    abstract findByHouseholdId(householdId: string): Promise<Pick<User, "id" | "name">[]>;
}
