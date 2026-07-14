import { Container } from "typescript-ioc";
import { AuthRepository } from "../../domain/contracts/auth-repository";
import { HttpAuthRepository } from "../repositories/auth-repository/http-auth-repository";

Container.bind(AuthRepository).to(HttpAuthRepository);
