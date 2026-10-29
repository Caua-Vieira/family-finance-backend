import { User } from "../../infrastructure/entities/users";
import { Household } from "../../infrastructure/entities/household";
import { CreateUserDTO } from "../types/create-user-dto";

export abstract class AuthRepository {
    abstract findByEmail(email: string): Promise<User | null>;
    abstract findByGoogleId(googleId: string): Promise<User | null>;
    abstract findByValidPasswordResetToken(tokenHash: string): Promise<User | null>;
    abstract findHouseholdByInviteCode(inviteCode: string): Promise<Household | null>;
    abstract createUserWithHousehold(data: CreateUserDTO): Promise<{ user: User; household: Household }>;
    abstract createUserInExistingHousehold(data: CreateUserDTO, householdId: string): Promise<User>;
    abstract linkGoogleAccount(userId: string, googleId: string): Promise<void>;
    abstract savePasswordResetToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void>;
    abstract updatePassword(userId: string, passwordHash: string): Promise<void>;
}
