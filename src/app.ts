import "reflect-metadata";
import "./infrastructure/config/ioc";
import express from "express";
import cors from "cors";
import { authRoutes } from "./infrastructure/interfaces/routes/auth.routes";
import { categoriesRoutes } from "./infrastructure/interfaces/routes/categories.routes";
import { cardRoutes } from "./infrastructure/interfaces/routes/card.routes";
import { transactionsRoutes } from "./infrastructure/interfaces/routes/transactions.routes";
import { errorHandler } from "./middleware/error-handler";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/auth", authRoutes());
app.use("/categories", categoriesRoutes());
app.use("/cards", cardRoutes());
app.use("/transactions", transactionsRoutes());

app.use(errorHandler);

export default app;