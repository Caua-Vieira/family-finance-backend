import { Container } from "typescript-ioc";
import { AuthRepository } from "../../domain/contracts/auth-repository";
import { HttpAuthRepository } from "../repositories/auth-repository/http-auth-repository";
import { CategoriesRepository } from "../../domain/contracts/categories-repository";
import { HttpCategoriesRepository } from "../repositories/categories-repository/http-categories-repository";

Container.bind(AuthRepository).to(HttpAuthRepository);
Container.bind(CategoriesRepository).to(HttpCategoriesRepository);
