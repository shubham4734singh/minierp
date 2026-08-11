import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';

let io: SocketIOServer;

export const initSocket = (server: Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Adjust for production
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn('Socket.io not initialized!');
  }
  return io;
};
