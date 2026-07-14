import { DataSource, ObjectType, QueryRunner, Repository } from "typeorm";
import { Singleton } from "typescript-ioc";
import { AppDataSource } from "./data-source";

@Singleton
export class Database {
    public appDataSource: DataSource;

    constructor() {
        this.appDataSource = AppDataSource;
    }

    async connect() {
        if (!this.appDataSource.isInitialized) {
            await this.appDataSource.initialize();
            console.log("Banco de dados conectado!");
        }
    }

    getRepository<T extends object>(entity: ObjectType<T>): Repository<T> {
        return this.appDataSource.getRepository(entity);
    }

    createQueryRunner(): QueryRunner {
        return this.appDataSource.createQueryRunner();
    }
}
