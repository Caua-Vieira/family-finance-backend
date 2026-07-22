import { Router } from "express";
import { Container } from "typescript-ioc";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { BudgetController } from "../controllers/budget-controller";

export const budgetRoutes = (): Router => {
    const router = Router();
    const budgetController = Container.get(BudgetController);

    router.post("/", authMiddleware, (req, res) => budgetController.create(req, res));
    router.get("/", authMiddleware, (req, res) => budgetController.list(req, res));
    router.put("/:id", authMiddleware, (req, res) => budgetController.update(req, res));
    router.delete("/:id", authMiddleware, (req, res) => budgetController.delete(req, res));

    return router;
};
