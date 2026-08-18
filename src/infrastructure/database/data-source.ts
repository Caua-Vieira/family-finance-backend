import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

// Neon (and most managed Postgres providers) require SSL; local Docker
// Postgres does not have SSL enabled, so we only turn it on when needed.
const useSsl = databaseUrl?.includes("neon.tech") ?? false;

export const AppDataSource = new DataSource({
    type: "postgres",
    url: databaseUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: false,
    entities: ["src/infrastructure/entities/**/*.ts"],
    migrations: ["src/infrastructure/database/migrations/**/*.ts"],
});
