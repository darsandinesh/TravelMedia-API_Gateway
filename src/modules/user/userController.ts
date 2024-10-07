import express, { Request, Response } from 'express';
import userRabbitMqClient from './rabbitMQ/client';
import { generateToken } from '../../jwt/jwtCreate';
const jwt = require('jsonwebtoken');

import config from '../../config/config';
import { emitUserStatus, sendNotification } from '../../socket/socketServer';

export const userController = {
    // Define memory storage object
    memoryStorage: {} as { [key: string]: any },

    register: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const operation = 'register_user';

            console.log(req.body, 'body print');

            const result: any = await userRabbitMqClient.produce(data, operation);
            console.log(result, 'register-user');

            userController.memoryStorage['user'] = JSON.stringify(result.user_data);

            return res.json({ data: result });
        } catch (error) {
            console.log('error in register user --> ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    otp: async (req: Request, res: Response) => {
        try {
            console.log('otp verify function triggered');
            const userData = JSON.parse(userController.memoryStorage['user']);
            const operation = 'save_user'
            const result: any = await userRabbitMqClient.produce(userData, operation);
            return res.json({ success: true, data: result });
        } catch (error) {
            console.log('Error in OTP verification:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    resendOtp: async (req: Request, res: Response) => {
        try {
            const userData = JSON.parse(userController.memoryStorage['user']);
            console.log(userData);
            const operation = 'resend_otp';
            const result: any = await userRabbitMqClient.produce(userData.email, operation);
            console.log(result, '------------------------------------------------------------------')
            return res.json({ success: true, data: result });
        } catch (error) {
            console.log('Error on resendOTP -->', error);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            console.log(req.body);
            const data = req.body;
            const operation = 'user_login';

            const result: any = await userRabbitMqClient.produce(data, operation);
            console.log(result, 'user-login');
            let role = 'user';

            if (result?.user_data?.isAdmin) role = 'admin'

            if (result.success) {
                const token = generateToken({ id: result.user_data._id, email: result.user_data.email, role: role });
                // res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
                result.token = token.accessToken;
                result.refreshToken = token.refreshToken
                emitUserStatus(result.user_data._id, true)
                return res.json(result);
            } else {
                res.json(result)
            }


        } catch (error) {
            console.log('error in userLogin --> ', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    loginWithGoogle: async (req: Request, res: Response) => {
        try {

            const data = req.body;
            console.log(data);
            const operation = 'google_login';
            const result: any = await userRabbitMqClient.produce(data, operation);
            console.log(result, 'res')
            let role = 'user';
            if (result.user_data.isAdmin) role = 'admin';
            if (result.success) {
                console.log('lllllllllllllllllllllllllllllllll-------------------------------lllllllllllllllllllllll', result)
                const token = await generateToken({ id: result.user_data._id, email: result.user_data.email, role: role });
                // res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
                result.token = token.accessToken;
                result.refreshToken = token.refreshToken
            }
            console.log(result)
            console.log(result);
            return res.json(result);

        } catch (error) {

        }
    },

    verifyEmail: async (req: Request, res: Response) => {
        try {
            console.log('verifyEmail in api-gateway');
            const operation = 'verify_Email';
            const data = req.body;
            const result: any = await userRabbitMqClient.produce(data, operation);
            console.log(result, '------------------result')
            return res.json(result);
        } catch (error) {

        }
    },

    resetPassword: async (req: Request, res: Response) => {
        try {
            console.log(req.body);
            const data = req.body;
            const operation = 'reset_password';
            const result: any = await userRabbitMqClient.produce(data, operation);
            // const result =  { success: true, message: 'Password changed successfull, Try logging in' };
            res.json(result);
        } catch (error) {

        }
    },

    followUser: async (req: Request, res: Response) => {
        try {
            console.log(req.body);
            const data = req.body
            console.log(data, 'noti follow user');
            const operation = 'folloUser';
            const result: any = await userRabbitMqClient.produce(data, operation);


            // live notificaiton 
            if (result.success) {
                const onlineUser: any = await userRabbitMqClient.produce(data.loggeduser, 'get-userProfile');

                const notificaiton: any = {
                    userId: data.loggeduser,
                    senderId: data.followedId,
                    type: 'FOLLOW',
                    message: `${onlineUser.data.name} started to follow you`,
                    avatar: onlineUser.data.profilePicture,
                    userName: onlineUser.data.name
                }

                sendNotification(notificaiton)

            }
            res.json(result);
        } catch (error) {

        }
    },

    unfollowUser: async (req: Request, res: Response) => {
        try {
            console.log(req.body);
            const data = req.body
            const operation = 'unfolloUser';
            const result: any = await userRabbitMqClient.produce(data, operation);
            res.json(result);
        } catch (error) {

        }
    },

    getFriends: async (req: Request, res: Response) => {
        try {
            const data = req.query.userId;
            const operation = 'getFriends';
            const result: any = await userRabbitMqClient.produce(data, operation);
            res.status(200).json(result)
        } catch (error) {
            console.log('Error in getFriends -->', error)
        }
    },

    editUserProfile: async (req: Request, res: Response) => {
        try {

            const image = req.file as Express.Multer.File | undefined;
            const data = req.body;
            const id = req.params.id;

            const validImageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

            if (image) {
                // Check if the uploaded file has a valid MIME type
                if (!validImageMimeTypes.includes(image.mimetype)) {
                    return res.status(400).json({ error: "Only image files are allowed" });
                }
            }

            console.log(image, '-----------image in API gateway');

            const operation = 'update-UserData';
            const response = await userRabbitMqClient.produce(
                { image, data, id }, operation
            );

            console.log(response, '------------');
            res.json(response);

        } catch (error) {
            console.log('error in editUserProfile in API gateway in userController:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    changeVisibility: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const operation = 'changeVisibility';
            const result = await userRabbitMqClient.produce(data, operation);
            res.status(200).json(result);
        } catch (error) {
            console.log('error in changeVisibility in API gateway in userController:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    searchUser: async (req: Request, res: Response) => {
        try {
            console.log(req.body.search);
            const operation = 'search_user';
            const result = await userRabbitMqClient.produce(req.body.search, operation);
            console.log(result);
            res.json(result)
        } catch (error) {
            console.log('error in search user in api gatway -- >', error)
        }
    },

    newUsers: async (req: Request, res: Response) => {
        try {
            const operation = 'getNewUsers';
            const result = await userRabbitMqClient.produce('', operation);
            res.json(result);
        } catch (error) {

        }
    },

    refreshToken: async (req: Request, res: Response) => {
        try {
            const { refreshToken } = req.body;
            console.log(refreshToken, 'ref toekn')
            // Check if the refresh token exists and is valid
            if (!refreshToken) {
                return res.status(403).json({ message: 'Refresh token not valid' });
            }

            // Verify the refresh token
            jwt.verify(refreshToken, config.jwt_key, (err: any, user: any) => {
                if (err) return res.status(403).json({ message: 'Forbidden' });

                console.log(err, '-----------', user)
                console.log('refresh token')
                // Create a new access token
                const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

                res.json({ accessToken });
            });
        } catch (error) {

        }
    },


    logout: async (req: Request, res: Response) => {
        try {

        } catch (error) {

        }
    },


};
