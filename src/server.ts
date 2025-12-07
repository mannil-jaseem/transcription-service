import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import { initializeRealtimeSocket } from './features/realtime/realtime.socket';

const startServer = async () => {
  try {
    await connectDB();

    const app = createApp();

    const httpServer = createServer(app);

    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    initializeRealtimeSocket(io);

    const PORT = parseInt(env.PORT, 10);
    httpServer.listen(PORT, () => {
      logger.info(`
═══════════════════════════════════════════════════════════
                                                            
   Server is running!                                    
                                                        
   URL: http://localhost:${PORT}                         
   Environment: ${env.NODE_ENV}                          
   Health Check: http://localhost:${PORT}/health         
   Test Route: http://localhost:${PORT}/api/test         
   WebSocket: ws://localhost:${PORT}                     
                                                            
═══════════════════════════════════════════════════════════
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

