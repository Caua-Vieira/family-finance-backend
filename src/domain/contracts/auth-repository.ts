import { User } from "../../infrastructure/entities/users";
import { CreateUserDTO } from "../types/create-user-dto";

export abstract class AuthRepository {
    abstract findByEmail(email: string): Promise<User | null>;
    abstract createUserWithHousehold(data: CreateUserDTO): Promise<User>;
}
