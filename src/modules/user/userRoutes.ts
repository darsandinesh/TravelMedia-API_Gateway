import express, { Request, Response } from 'express'
import { userController } from './userController';
import authencticateToken from '../../middleware/authMiddleware';
import upload from '../../multer/multer';

const userRoutes = express.Router();
const authMiddleware = authencticateToken({ role: 'user' });

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

// follow and unfollow
userRoutes.post('/follow', authMiddleware, userController.followUser)
userRoutes.post('/unfollow', authMiddleware, userController.unfollowUser)

// get the followers and following 
userRoutes.get('/getFriends', authMiddleware, userController.getFriends)

// edit in userProfile
userRoutes.put('/userProfile/:id', authMiddleware, upload.single('avatar'), userController.editUserProfile)
userRoutes.post('/changeVisibility',authMiddleware,userController.changeVisibility)
//search user 
userRoutes.post('/searchUser', authMiddleware, userController.searchUser)

userRoutes.get('/newUsers', authMiddleware, userController.newUsers);

// save liked posts 
userRoutes.post('/savePost',authMiddleware,userController.savePost)

// membership route 
userRoutes.get('/membership',authMiddleware,userController.membership);
userRoutes.post('/savePayment',authMiddleware,userController.savePayment);

// refresh token verification
userRoutes.post('/refresh-token', userController.refreshToken)

// authentication check 
userRoutes.get('/', authencticateToken)



export { userRoutes }