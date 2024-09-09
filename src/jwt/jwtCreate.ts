import jwt from 'jsonwebtoken';
import config from '../config/config';
import { access } from 'fs';

interface userPayload {
    id: string,
    email: string
}

export const generateToken = (user: userPayload) => {

    const payload = {
        id: user.id,
        email: user.email,
    }

    const options = {
        expiresIn: '1h'
    }

    const accessToken = jwt.sign(payload, config.jwt_key as string, options);
    const refreshToken = jwt.sign(payload, config.jwt_key as string, { expiresIn: '7d' });
    return accessToken
    // return {
    //     acess, re
    // }
}