import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

const useSsl = databaseUrl?.includes("neon.tech") ?? false;

// __dirname aponta pra dentro de src/infrastructure/database (dev)
// ou dist/infrastructure/database (produção, compilado) — a extensão
// acompanha automaticamente qual dos dois é o caso.
const isCompiled = __filename.endsWith(".js");
const extension = isCompiled ? "js" : "ts";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: databaseUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: false,
    entities: [path.join(__dirname, `../entities/**/*.${extension}`)],
    migrations: [path.join(__dirname, `./migrations/**/*.${extension}`)],
});