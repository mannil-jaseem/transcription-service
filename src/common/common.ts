import { randomUUID } from 'crypto';

export const generateUUID = (): string => {
  return randomUUID();
};

export const formatErrorResponse = (message: string, details?: unknown) => {
  return {
    success: false,
    error: {
      message,
      details,
    },
  };
};

export const formatSuccessResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    message: message || 'Operation successful',
    data,
  };
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

