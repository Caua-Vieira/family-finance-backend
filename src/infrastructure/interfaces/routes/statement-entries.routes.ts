import { Router } from "express";
import { Container } from "typescript-ioc";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { StatementEntryController } from "../controllers/statement-entry-controller";
import { InvalidFileException } from "../../../domain/errors/errors";

// O mimetype de CSV varia muito entre navegadores/SOs (text/csv,
// application/vnd.ms-excel, text/plain...), então a validação é pela extensão.
const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, callback) => {
        if (!ALLOWED_EXTENSIONS.includes(path.extname(file.originalname).toLowerCase())) {
            callback(new InvalidFileException("Formato de arquivo inválido. Envie um CSV ou uma planilha Excel (.xlsx ou .xls)"));
            return;
        }
        callback(null, true);
    },
});

export const statementEntriesRoutes = (): Router => {
    const router = Router();
    const statementEntryController = Container.get(StatementEntryController);

    router.post("/import/preview", authMiddleware, upload.single("file"), (req, res) =>
        statementEntryController.previewImport(req, res)
    );
    router.post("/import", authMiddleware, (req, res) => statementEntryController.importEntries(req, res));
    router.get("/", authMiddleware, (req, res) => statementEntryController.list(req, res));
    router.post("/", authMiddleware, (req, res) => statementEntryController.create(req, res));
    router.put("/:id", authMiddleware, (req, res) => statementEntryController.update(req, res));
    router.delete("/:id", authMiddleware, (req, res) => statementEntryController.delete(req, res));

    return router;
};
