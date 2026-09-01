import { Router } from "express";
import { Container } from "typescript-ioc";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { cronMiddleware } from "../../../middleware/cron-middleware";
import { RecurringTransactionController } from "../controllers/recurring-transaction-controller";

export const recurringRoutes = (): Router => {
    const router = Router();
    const recurringTransactionController = Container.get(RecurringTransactionController);

    router.post("/generate", cronMiddleware, (req, res) => recurringTransactionController.generate(req, res));
    router.get("/", authMiddleware, (req, res) => recurringTransactionController.list(req, res));
    router.post("/", authMiddleware, (req, res) => recurringTransactionController.create(req, res));
    router.put("/:id", authMiddleware, (req, res) => recurringTransactionController.update(req, res));

    return router;
};
