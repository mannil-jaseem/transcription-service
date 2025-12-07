import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from './error.middleware';
import { HTTP_STATUS, ERROR_MESSAGES } from '../common/constants';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      (req as any).validatedData = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));

        next(
          new AppError(
            HTTP_STATUS.UNPROCESSABLE_ENTITY,
            ERROR_MESSAGES.VALIDATION_ERROR,
            errorDetails
          )
        );
        return;
      }

      next(error);
    }
  };
};

