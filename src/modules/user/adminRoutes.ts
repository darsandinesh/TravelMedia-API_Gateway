import express from 'express';
import { AdminController } from './adminController';
import authencticateToken from '../../middleware/authMiddleware';

const adminRoutes = express.Router();

adminRoutes.post('/login', AdminController.login)
adminRoutes.get('/userlist',authencticateToken, AdminController.userlist);
adminRoutes.post('/changeStatus',authencticateToken, AdminController.changeStatus)

// verify jwt
adminRoutes.get('/verifyJWT', authencticateToken)

export { adminRoutes }