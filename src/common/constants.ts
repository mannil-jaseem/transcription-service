export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
} as const;

export const APP_CONSTANTS = {
  DEFAULT_TIMEOUT: 30000,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const AZURE_SPEECH = {
  DEFAULT_LANGUAGES: [
    'en-US',
    'en-GB',
    'es-ES',
    'es-MX',
    'fr-FR',
    'de-DE',
    'it-IT',
    'pt-BR',
    'ja-JP',
    'ko-KR',
    'zh-CN',
    'ar-SA',
    'hi-IN',
    'ru-RU',
  ] as const,
  AUTO_DETECT_LANGUAGE_PROPERTY: 'SpeechServiceConnection_AutoDetectSourceLanguageResult',
} as const;

