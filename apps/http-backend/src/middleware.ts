import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction){
    const token = req.headers.authorization ?? "";
    if(!token){
        return res.status(401).json({ status: 'Error', message: 'Access token is missing or invalid' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // TODO: Add global.d.ts to fix this
        // @ts-expect-error
    // this needs to be fixed later
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