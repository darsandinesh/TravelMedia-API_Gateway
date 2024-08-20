import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import config from "../config/config";

const authencticateToken = (req: Request, res: Response, next: NextFunction) => {
    console.log('fucniton is triggered auth valdation')
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token ) {
        console.log('inside if')
        return { success: false, message: 'Access denied, Token not found' };
    }

    console.log('after token')
    jwt.verify(token, config.jwt_key as string, (err, decode) => {
        if (err) {
            return { success: false, message: 'Invalid Token' };
        }
        // return { success: true, message: 'Token Verified' };
        next();
    })
}

export default authencticateToken