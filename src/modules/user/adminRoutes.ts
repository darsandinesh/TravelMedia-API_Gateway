import express from 'express';
import { AdminController } from './adminController';
import authencticateToken from '../../middleware/authMiddleware';



const adminRoutes = express.Router();

const authMiddleware = authencticateToken({ role: 'admin' });


adminRoutes.post('/login', AdminController.login)
adminRoutes.get('/userlist', authMiddleware, AdminController.userlist);
adminRoutes.post('/changeStatus', authMiddleware, AdminController.changeStatus);
adminRoutes.get('/getNewUsers', authMiddleware, AdminController.getNewUsers);
adminRoutes.get('/getTotalUsers', authMiddleware, AdminController.getTotalUsers);



// axiosInstance.get('/post/getNewPosts'),
// axiosInstance.get('/post/getTotalPosts'),

// verify jwt
adminRoutes.get('/verifyJWT', authMiddleware)

export { adminRoutes }