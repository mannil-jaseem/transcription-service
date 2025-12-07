import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { formatErrorResponse } from '../common/common';
import { HTTP_STATUS, ERROR_MESSAGES } from '../common/constants';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      formatErrorResponse(err.message, err.details)
    );
    return;
  }

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
    formatErrorResponse(ERROR_MESSAGES.INTERNAL_ERROR, {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    })
  );
};

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    HTTP_STATUS.NOT_FOUND,
    `Route ${req.method} ${req.path} not found`
  );
  next(error);
};

