import { Router } from "express";
import { Container } from "typescript-ioc";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { InvestmentController } from "../controllers/investment-controller";

export const investmentsRoutes = (): Router => {
    const router = Router();
    const investmentController = Container.get(InvestmentController);

    router.get("/", authMiddleware, (req, res) => investmentController.list(req, res));
    router.post("/", authMiddleware, (req, res) => investmentController.create(req, res));
    router.put("/:id", authMiddleware, (req, res) => investmentController.update(req, res));
    router.delete("/:id", authMiddleware, (req, res) => investmentController.delete(req, res));

    return router;
};
