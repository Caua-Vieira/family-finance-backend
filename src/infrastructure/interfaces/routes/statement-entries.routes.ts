import { Router } from "express";
import { Container } from "typescript-ioc";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { StatementEntryController } from "../controllers/statement-entry-controller";

export const statementEntriesRoutes = (): Router => {
    const router = Router();
    const statementEntryController = Container.get(StatementEntryController);

    router.get("/", authMiddleware, (req, res) => statementEntryController.list(req, res));
    router.post("/", authMiddleware, (req, res) => statementEntryController.create(req, res));
    router.put("/:id", authMiddleware, (req, res) => statementEntryController.update(req, res));
    router.delete("/:id", authMiddleware, (req, res) => statementEntryController.delete(req, res));

    return router;
};
