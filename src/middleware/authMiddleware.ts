import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import config from "../config/config";

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    console.log('Function is triggered for authentication validation');

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('Token not found');
        return res.status(401).json({ success: false, message: 'Access denied, token not found' });
    }

    console.log('Token found, verifying...');
    jwt.verify(token, config.jwt_key as string, (err, decoded) => {
        if (err) {
            console.log('Invalid token');
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }

        // Assuming the token payload contains the user's _id
        if (decoded && typeof decoded !== 'string' && decoded._id) {
            
            console.log('Token verified, user ID attached:', req.body.userId);
        }

        // If your payload has a different structure, adjust the above code to match it
        next();
    });
}

export default authenticateToken;
