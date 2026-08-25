import { Router } from "express";
import { Container } from "typescript-ioc";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { HouseholdController } from "../controllers/household-controller";

export const householdRoutes = (): Router => {
    const router = Router();
    const householdController = Container.get(HouseholdController);

    router.get("/", authMiddleware, (req, res) => householdController.get(req, res));

    return router;
};
