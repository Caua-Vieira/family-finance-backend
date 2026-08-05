import { Router } from "express";
import { Container } from "typescript-ioc";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { DashboardController } from "../controllers/dashboard-controller";

export const dashboardRoutes = (): Router => {
    const router = Router();
    const dashboardController = Container.get(DashboardController);

    router.get("/summary", authMiddleware, (req, res) => dashboardController.getSummary(req, res));

    return router;
};
