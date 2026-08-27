import { User } from "../../infrastructure/entities/users";
import { Household } from "../../infrastructure/entities/household";
import { CreateUserDTO } from "../types/create-user-dto";

export abstract class AuthRepository {
    abstract findByEmail(email: string): Promise<User | null>;
    abstract findHouseholdByInviteCode(inviteCode: string): Promise<Household | null>;
    abstract createUserWithHousehold(data: CreateUserDTO): Promise<{ user: User; household: Household }>;
    abstract createUserInExistingHousehold(data: CreateUserDTO, householdId: string): Promise<User>;
}
