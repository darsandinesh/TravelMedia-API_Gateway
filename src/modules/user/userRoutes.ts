import express, { Request, Response } from 'express'
import { userController } from './userController';
import authencticateToken from '../../middleware/authMiddleware';
import upload from '../../multer/multer';

const userRoutes = express.Router();

userRoutes.get('/', (req: Request, res: Response) => {
    res.json({ success: true, message: 'sample test' })
})

userRoutes.post('/register', userController.register);
userRoutes.post('/verifyOtp', userController.otp);
userRoutes.post('/resendOtp', userController.resendOtp);
userRoutes.post('/login', userController.login);
userRoutes.post('/google-login', userController.loginWithGoogle)
userRoutes.post('/logout', userController.logout);
userRoutes.post('/verifyEmail', userController.verifyEmail);
userRoutes.post('/resetPassword', userController.resetPassword)

// edit in userProfile
userRoutes.put('/userProfile/:id', upload.single('avatar'), userController.editUserProfile)
//search user 
userRoutes.post('/searchUser',userController.searchUser)

// home page
userRoutes.get('/', authencticateToken)



export { userRoutes }