import { Container } from "typescript-ioc";
import { AuthRepository } from "../../domain/contracts/auth-repository";
import { HttpAuthRepository } from "../repositories/auth-repository/http-auth-repository";
import { CategoriesRepository } from "../../domain/contracts/categories-repository";
import { HttpCategoriesRepository } from "../repositories/categories-repository/http-categories-repository";
import { CardRepository } from "../../domain/contracts/card-repository";
import { HttpCardRepository } from "../repositories/card-repository/http-card-repository";

Container.bind(AuthRepository).to(HttpAuthRepository);
Container.bind(CategoriesRepository).to(HttpCategoriesRepository);
Container.bind(CardRepository).to(HttpCardRepository);
