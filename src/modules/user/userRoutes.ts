import express, { Request, Response } from 'express'
import { userController } from './userController';

const userRoutes = express.Router();

userRoutes.get('/', (req: Request, res: Response) => {
    res.json({ success: true, message: 'sample test' })
})

userRoutes.post('/register', userController.register);
userRoutes.post('/verifyOtp', userController.otp);
// userRoutes.post('/resendOtp', userController.resendOtp);
userRoutes.post('/login', userController.login);
userRoutes.post('/google-login',userController.loginWithGoogle)
userRoutes.post('/logout', userController.logout);
userRoutes.post('/verifyEmail',userController.verifyEmail);
userRoutes.post('/resetPassword',userController.resetPassword)



export { userRoutes }