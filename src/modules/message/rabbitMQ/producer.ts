import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import userRabbitMQClient from '../../user/rabbitMQ/client';
import { Socket } from 'dgram';

interface User {
    id: string,
    _id: string
}

interface RabbitMQResponse<T> {
    success: boolean;
    message: string;
    data?: T
}

let io: Server;

export const initialzeSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ["POST", "GET"],
            credentials: true,
        }
    })

    io.on('connection',(socket)=>{
        console.log('user connected ->',socket.id);

        
    })
}