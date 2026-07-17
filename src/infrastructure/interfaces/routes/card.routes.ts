import { Router } from "express";
import { Container } from "typescript-ioc";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { CardController } from "../controllers/card-controller";

export const cardRoutes = (): Router => {
    const router = Router();
    const cardController = Container.get(CardController);

    router.post("/register", authMiddleware, (req, res) => cardController.register(req, res));
    router.get("/", authMiddleware, (req, res) => cardController.list(req, res));
    router.put("/:id", authMiddleware, (req, res) => cardController.update(req, res));
    router.delete("/:id", authMiddleware, (req, res) => cardController.delete(req, res));

    return router;
};
