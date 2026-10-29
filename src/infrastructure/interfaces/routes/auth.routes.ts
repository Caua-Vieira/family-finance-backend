import { Router } from "express";
import { Container } from "typescript-ioc";
import { AuthController } from "../controllers/auth-controller";

export const authRoutes = (): Router => {
    const router = Router();
    const authController = Container.get(AuthController);

    router.post("/register", (req, res) => authController.register(req, res));
    router.post("/login", (req, res) => authController.login(req, res));
    router.post("/google", (req, res) => authController.google(req, res));
    router.post("/forgot-password", (req, res) => authController.forgotPassword(req, res));
    router.post("/reset-password", (req, res) => authController.resetPassword(req, res));

    return router;
};
