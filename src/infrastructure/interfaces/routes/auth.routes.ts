import { Router } from "express";
import { Container } from "typescript-ioc";
import { AuthController } from "../controllers/auth-controller";

export const authRoutes = (): Router => {
    const router = Router();
    const authController = Container.get(AuthController);

    router.post("/register", (req, res) => authController.register(req, res));
    router.post("/auth", (req, res) => authController.login(req, res));

    return router;
};
