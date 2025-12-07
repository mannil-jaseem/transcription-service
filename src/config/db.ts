import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    if (!env.MONGODB_URI) {
      logger.warn('MONGODB_URI not provided, skipping database connection');
      return;
    }

    await mongoose.connect(env.MONGODB_URI);
    logger.info('Info: MongoDB connected successfully');
  } catch (error) {
    logger.error('Error: MongoDB connection failed:', error);
    process.exit(1);
  }
};

