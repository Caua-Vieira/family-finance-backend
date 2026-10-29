import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { DatabaseException, HouseholdRequiredException, InvalidCategoryException, InvalidCredentialsException, InvalidFileException, InvalidInvestmentException, InvalidRegisterException, InvalidTokenException, NotFoundException, UserAlreadyExistsException } from "../domain/errors/errors";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof MulterError || err instanceof InvalidFileException) {
        res.status(400).json({ error: err.message });
        return;
    }

    if (err instanceof NotFoundException) {
        res.status(404).json({ error: err.message });
        return;
    }

    if (err instanceof DatabaseException) {
        res.status(500).json({ error: 'Erro no banco de dados: ' + err.message });
        return;
    }

    if (err instanceof InvalidCredentialsException) {
        res.status(401).json({ error: err.message });
        return;
    }

    if (err instanceof UserAlreadyExistsException) {
        res.status(409).json({ error: err.message });
        return;
    }

    if (err instanceof InvalidCategoryException) {
        res.status(400).json({ error: err.message });
        return;
    }

    if (err instanceof InvalidInvestmentException) {
        res.status(400).json({ error: err.message });
        return;
    }

    if (err instanceof InvalidRegisterException) {
        res.status(400).json({ error: err.message });
        return;
    }

    if (err instanceof InvalidTokenException) {
        res.status(400).json({ error: err.message });
        return;
    }

    // O frontend usa o code para pedir a família antes de concluir o cadastro pelo Google
    if (err instanceof HouseholdRequiredException) {
        res.status(422).json({ error: err.message, code: "HOUSEHOLD_REQUIRED" });
        return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
}