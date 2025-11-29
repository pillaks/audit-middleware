import { Request, Response } from 'express';

export interface AuditMiddlewareConfig {
  security?: {
    enabled?: boolean;
    helmet?: any;
    cors?: {
      enabled?: boolean;
      options?: any;
    };
    rateLimit?: {
      enabled?: boolean;
      windowMs?: number;
      maxRequests?: number;
      skipSuccessfulRequests?: boolean;
    };
  };
  
  logging?: {
    enabled?: boolean;
    format?: 'json' | 'simple';
    level?: 'info' | 'warn' | 'error';
    logRequestBody?: boolean;
    logResponseBody?: boolean;
    sanitizeFields?: string[];
  };
  
  metrics?: {
    enabled?: boolean;
    endpoint?: string | null;
    collectDefaultMetrics?: boolean;
  };
  
  skipPaths?: string[];
  customLoggers?: Array<(req: Request, res: Response, data: any) => void>;
}