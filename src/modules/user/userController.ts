import express, { Request, Response } from 'express';
import userRabbitMqClient from './rabbitMQ/client';
import { generateToken } from '../../jwt/jwtCreate';

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
            const data = req.body;
            const operation = 'user_login';

            const result: any = await userRabbitMqClient.produce(data, operation);
            console.log(result, 'user-login');

            if (result.success) {
                const token = generateToken({ id: result.user_data._id, email: result.user_data.email });
                // res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
                result.token = token;
            }

            return res.json(result);
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
            console.log(result)
            if (result.success) {
                console.log('lllllllllllllllllllllllllllllllll-------------------------------lllllllllllllllllllllll', result)
                const token = await generateToken({ id: result.user_data._id, email: result.user_data.email });
                // res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
                result.token = token;
            }

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

    editUserProfile: async (req: Request, res: Response) => {
        try {
            console.log(req.file, '=============userController for edit profile image');
            console.log(req.body, '-------------userController for edit profile userData');
            console.log(req.params.id, '00000000 userController for edit profile userID');

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


    logout: async (req: Request, res: Response) => {
        try {

        } catch (error) {

        }
    },


};
