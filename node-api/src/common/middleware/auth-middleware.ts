import { NextFunction, Response, Request } from "express";
import { Token } from "../../database/models/token";
import { verify } from "jsonwebtoken";
import { db } from "../../database/db";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({"error": "Unauthorized"});

    const token = authHeader.split(' ')[1];
    if (token === null) return res.status(401).json({"error": "Unauthorized"});

    const tokenRepo = db.getRepository(Token)
    const tokenFound = await tokenRepo.findOne({ where: { token } })
    if (!tokenFound) {
        return res.status(403).json({"error": "Access Forbidden"})
    }
    const secret = process.env.JWT_SECRET ?? ""
    verify(token, secret, (err, user) => {
        if (err) return res.status(403).json({"error": "Access Forbidden"});
        (req as any).user = user;
        next();
    });
}