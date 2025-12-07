import express, { Express } from 'express';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import routes from './routes';

export const createApp = (): Express => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(routes);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
};

