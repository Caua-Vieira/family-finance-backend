import { Router } from "express";
import { Container } from "typescript-ioc";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { AdvisorController } from "../controllers/advisor-controller";

export const advisorRoutes = (): Router => {
    const router = Router();
    const advisorController = Container.get(AdvisorController);

    router.get("/spending-capacity", authMiddleware, (req, res) => advisorController.getSpendingCapacity(req, res));
    router.post("/chat", authMiddleware, (req, res) => advisorController.chat(req, res));

    return router;
};
