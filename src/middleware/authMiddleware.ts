// src/modules/user/authenticateToken.ts

import { NextFunction, Request, Response } from "express";
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import config from "../config/config";

interface AuthMiddlewareOptions {
    role: string;
}



const authenticateToken = (options: AuthMiddlewareOptions): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        console.log('Function is triggered for authentication validation');

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            console.log('Token not found');
            return res.status(401).json({ success: false, message: 'Access denied, token not found' });
        }

        console.log('Token found, verifying...');
        jwt.verify(token, config.jwt_key as string, (err, decoded:any) => {
            if (err) {
                console.log('Invalid token');
                return res.status(401).json({ success: false, message: 'Invalid token' });
            }
            console.log('Decoded token:', decoded);
            console.log('Decoded role:', decoded?.role);

            console.log('Additional value:', options.role);

            if (decoded) {
                console.log('Token verified, user ID attached:', req.body.userId);
                console.log(decoded.role)
                if (options.role === decoded.role) {
                    next();
                } else {
                    next();
                    // return res.status(401).json({ success: false, message: 'Un authorized' });
                }
            } else {
                console.log('else in decode value')
            }


        });
    };
};

export default authenticateToken;
