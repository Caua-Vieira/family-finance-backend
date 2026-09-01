import { NextFunction, Request, Response } from "express";

export function cronMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token não informado" });
    }

    const [, token] = authHeader.split(" ");

    if (!process.env.CRON_SECRET || token !== process.env.CRON_SECRET) {
        return res.status(401).json({ message: "Token inválido" });
    }

    return next();
}
