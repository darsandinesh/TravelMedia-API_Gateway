import { Request, Response } from "express";
import adminRabbitMqClient from './rabbitMQ/client';
import { generateToken } from "../../jwt/jwtCreate";
import authencticateToken from "../../middleware/authMiddleware";

export const AdminController = {

    login: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            console.log(data);
            const operation = 'admin_login'
            const result: any = await adminRabbitMqClient.produce(data, operation);
            console.log(result);
            if (result.success) {
                const token = generateToken({ id: result.data._id, email: result.data.email });
                result.token = token;
            }
            return res.json({ result });
        } catch (error) {
            console.log('error in adminlogin', error);
            return res.status(500).json({ error: 'internal server error' });
        }
    },

    userlist: async (req: Request, res: Response) => {
        try {
            console.log('user list fuction is called');
            const operation = 'user_list';
            const data = 'admin'
            const result: any = await adminRabbitMqClient.produce(data, operation)
            res.json(result);
        } catch (error) {
            console.log('error in adminlogin', error);
            return res.status(500).json({ error: 'internal server error' });
        }
    },

    changeStatus: async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const operation = 'change_status';
            const result: any = await adminRabbitMqClient.produce(data, operation);
            res.json(result);
        } catch (error) {

        }
    },


}