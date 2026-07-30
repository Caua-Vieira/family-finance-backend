import { Router } from "express";
import { Container } from "typescript-ioc";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { UsersController } from "../controllers/users-controller";

export const usersRoutes = (): Router => {
    const router = Router();
    const usersController = Container.get(UsersController);

    router.get("/", authMiddleware, (req, res) => usersController.list(req, res));

    return router;
};
