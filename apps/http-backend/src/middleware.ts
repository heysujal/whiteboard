import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";

export function middleware(req: Request, res: Response, next: NextFunction){
    const token = req.headers.authorization ?? "";
    if(!token){
        return res.status(401).json({ status: 'Error', message: 'Access token is missing or invalid' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // TODO: Add global.d.ts to fix this
        // @ts-ignore
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            status: "Error",
            message: "Unauthotized: Invalid token"
        })
    }
}