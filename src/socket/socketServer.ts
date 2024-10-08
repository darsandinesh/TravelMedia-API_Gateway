import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import messageRabbitMqClient from '../modules/message/rabbitMQ/client';
import postRabbitMqClient from '../modules/posts/rabbitMQ/client';
import userRabbitMqClient from '../modules/user/rabbitMQ/client';

interface User {
    id: string;
    _id: string;
}

interface RabbitMQResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

let io: Server;
const onlineUsers = new Map<string, string>();

export const initializeSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['POST', 'GET'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log('user connected ->', socket.id);

        socket.on('userConnected', (userId) => {
            console.log(userId)
            onlineUsers.set(userId, socket.id);
            console.log(`User ${userId} connected with socket ${socket.id}`);
            console.log('Current online users:', Array.from(onlineUsers.entries()));
        });

        socket.on('joinConversation', (chatId) => {
            socket.join(chatId);
            console.log('User joined conversation', chatId, 'Socket ID:', socket.id);
        });

        socket.on('userTyping', (id) => {
            console.log('user is typing ', id);
            const receiverSocketId = onlineUsers.get(id) || '';
            socket.to(receiverSocketId).emit('onUserTyping')

        })

        socket.on('sendMessage', async (message) => {
            console.log('Received message:', message);

            try {
                const operation = 'save-message';
                const response: any = await messageRabbitMqClient.produce(message, operation);
                console.log(response, 'response in sendMesage socker')
                if (response.success) {
                    io.to(message.chatId).emit('newMessage', message);
                    console.log('Message sent to chat:', message.chatId);
                } else {
                    console.error('Failed to send message:', response.message);
                }
            } catch (err) {
                console.error('Error sending message to RabbitMQ:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id);

            for (const [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    console.log(`Removed user ${userId} from online users`);
                    break;
                }
            }
        });
    });
};

export const emitUserStatus = (userId: string, isOnline: boolean) => {
    if (io) {
        io.emit('userStatusChanged', { userId, isOnline });
    } else {
        console.log('Socket.io not initialized');
    }
};

// interface notification {
//     logged:string,
//     postId?:string,
// }

export const sendNotification = async (notificationData: any) => {
    console.log('sendNotification triggered in socketio.', notificationData)
    const receiverSocketId = onlineUsers.get(notificationData.senderId);

    const notification = await messageRabbitMqClient.produce(notificationData, 'save-notification')
    console.log(notification)

    if (receiverSocketId) {
        io.to(receiverSocketId).emit('newNotification', notificationData);
    } else {
        console.log('user is not in online')
    }
}
