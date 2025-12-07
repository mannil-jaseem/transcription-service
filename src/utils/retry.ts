import { logger } from './logger';
import { APP_CONSTANTS } from '../common/constants';
import { sleep } from '../common/common';

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = APP_CONSTANTS.MAX_RETRY_ATTEMPTS,
    delay = APP_CONSTANTS.RETRY_DELAY,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        logger.error(`All ${maxAttempts} retry attempts failed`);
        throw lastError;
      }

      const waitTime = delay * Math.pow(2, attempt - 1);
      logger.warn(`Attempt ${attempt} failed, retrying in ${waitTime}ms...`);
      
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      await sleep(waitTime);
    }
  }

  throw lastError!;
}

