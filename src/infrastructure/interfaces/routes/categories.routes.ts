import { Router } from "express";
import { Container } from "typescript-ioc";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { CategoriesController } from "../controllers/categories-controller";

export const categoriesRoutes = (): Router => {
    const router = Router();
    const categoriesController = Container.get(CategoriesController);

    router.post("/", authMiddleware, (req, res) => categoriesController.create(req, res));
    router.get("/", authMiddleware, (req, res) => categoriesController.list(req, res));
    router.delete("/:id", authMiddleware, (req, res) => categoriesController.delete(req, res));

    return router;
};
