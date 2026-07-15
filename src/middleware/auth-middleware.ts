import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Token não informado" });
    }

    const [, token] = authHeader.split(" ");

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        (req as any).user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }
}