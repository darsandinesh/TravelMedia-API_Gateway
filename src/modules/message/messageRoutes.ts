import express from 'express';
import authencticateToken from '../../middleware/authMiddleware';
import { messageController } from './messageController';
import upload from '../../multer/multer';

const messageRouter = express.Router();


const authMiddleware = authencticateToken({ role: 'user' });

messageRouter.get('/getConversationData', authMiddleware, messageController.getConversationData);
messageRouter.post('/createChatId', authMiddleware, messageController.getChatId);
messageRouter.get('/getmessages', authMiddleware, messageController.getMessage);
messageRouter.get('/getNotification',authMiddleware,messageController.getNotification)

export {messageRouter}