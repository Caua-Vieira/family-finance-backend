import "reflect-metadata";
import "./infrastructure/config/ioc";
import express, { Router } from "express";
import cors from "cors";
import { authRoutes } from "./infrastructure/interfaces/routes/auth.routes";
import { categoriesRoutes } from "./infrastructure/interfaces/routes/categories.routes";
import { cardRoutes } from "./infrastructure/interfaces/routes/card.routes";
import { transactionsRoutes } from "./infrastructure/interfaces/routes/transactions.routes";
import { budgetRoutes } from "./infrastructure/interfaces/routes/budget.routes";
import { usersRoutes } from "./infrastructure/interfaces/routes/users.routes";
import { dashboardRoutes } from "./infrastructure/interfaces/routes/dashboard.routes";
import { householdRoutes } from "./infrastructure/interfaces/routes/household.routes";
import { recurringRoutes } from "./infrastructure/interfaces/routes/recurring.routes";
import { errorHandler } from "./middleware/error-handler";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

const apiRouter = Router();

apiRouter.use("/auth", authRoutes());
apiRouter.use("/categories", categoriesRoutes());
apiRouter.use("/cards", cardRoutes());
apiRouter.use("/transactions", transactionsRoutes());
apiRouter.use("/budgets", budgetRoutes());
apiRouter.use("/users", usersRoutes());
apiRouter.use("/dashboard", dashboardRoutes());
apiRouter.use("/household", householdRoutes());
apiRouter.use("/recurring", recurringRoutes());

app.use("/api", apiRouter);

app.use(errorHandler);

export default app;