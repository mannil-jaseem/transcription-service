import fs from 'fs/promises';
import { logger } from '../utils/logger';

export const downloadAudioAsBuffer = async (filePath: string): Promise<Buffer> => {
  try {
    logger.debug(`Reading audio from local file: ${filePath}`);
    const buffer = await fs.readFile(filePath);
    logger.info(`Audio read successfully. Size: ${buffer.length} bytes`);
    return buffer;
  } catch (error) {
    logger.error(`Error reading audio from ${filePath}:`, error);
    throw error;
  }
};

