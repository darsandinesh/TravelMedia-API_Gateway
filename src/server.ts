import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from './utils/logger';
import { userRoutes } from './modules/user/userRoutes'
import { adminRoutes } from './modules/user/adminRoutes';
import { postRoutes } from './modules/posts/postRoutes'
import { initializeSocket } from './socket/socketServer';
import config from './config/config';
import dotenv from 'dotenv';
import { messageRouter } from './modules/message/messageRoutes';
dotenv.config()

const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

app.use('/admin', adminRoutes);
app.use('/post', postRoutes);
app.use('/message', messageRouter);
app.use('/', userRoutes);


const server = http.createServer(app);
initializeSocket(server);

const startServer = async () => {
    try {
        console.log(`Config Port: ${config.port}`, '----', typeof (process.env.PORT));
        server.listen(config.port, () => {
            logger.info(`Service is running on port ${config.port}`);
            logger.info(`service is running `)
        });
    } catch (error) {
        logger.error('Something went wrong ->', error);
    }
}

startServer();