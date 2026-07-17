import { Router } from "express";
import { Container } from "typescript-ioc";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { TransactionController } from "../controllers/transaction-controller";

export const transactionsRoutes = (): Router => {
    const router = Router();
    const transactionController = Container.get(TransactionController);

    router.post("/", authMiddleware, (req, res) => transactionController.create(req, res));

    return router;
};
