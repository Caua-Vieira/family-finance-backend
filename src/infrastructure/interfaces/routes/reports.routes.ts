import { Router } from "express";
import { Container } from "typescript-ioc";
import { cronMiddleware } from "../../../middleware/cron-middleware";
import { ReportsController } from "../controllers/reports-controller";

export const reportsRoutes = (): Router => {
    const router = Router();
    const reportsController = Container.get(ReportsController);

    router.post("/monthly-summary", cronMiddleware, (req, res) => reportsController.sendMonthlySummary(req, res));

    return router;
};
