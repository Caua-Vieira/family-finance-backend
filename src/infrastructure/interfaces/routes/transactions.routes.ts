import { Router } from "express";
import { Container } from "typescript-ioc";
import multer from "multer";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { TransactionController } from "../controllers/transaction-controller";
import { InvalidFileException } from "../../../domain/errors/errors";

const ALLOWED_MIME_TYPES = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            callback(new InvalidFileException("Formato de arquivo inválido. Envie um arquivo Excel (.xlsx ou .xls)"));
            return;
        }
        callback(null, true);
    },
});

export const transactionsRoutes = (): Router => {
    const router = Router();
    const transactionController = Container.get(TransactionController);

    router.post("/import", authMiddleware, upload.single("file"), (req, res, next) =>
        transactionController.import(req, res).catch(next)
    );
    router.post("/", authMiddleware, (req, res) => transactionController.create(req, res));
    router.get("/", authMiddleware, (req, res) => transactionController.list(req, res));
    router.put("/:id", authMiddleware, (req, res) => transactionController.update(req, res));
    router.delete("/:id", authMiddleware, (req, res) => transactionController.delete(req, res));

    return router;
};
