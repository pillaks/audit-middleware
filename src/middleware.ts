import { Request, Response, NextFunction } from 'express';
import { AuditMiddlewareConfig } from './types';
import { setupSecurity } from './security/helmet';
import { setupCors } from './security/cors';
import { setupRateLimit } from './security/rate-limit';
import { createLogger } from './logging/logger';
import { setupMetrics, collectMetrics, metricsHandler } from './metrics/collector';

export const createAuditMiddleware = (userConfig: AuditMiddlewareConfig = {}) => {
  const config: AuditMiddlewareConfig = {
    security: {
      enabled: true,
      helmet: {},
      cors: { enabled: true, options: {} },
      rateLimit: { 
        enabled: true, 
        windowMs: 15 * 60 * 1000,
        maxRequests: 100,
        skipSuccessfulRequests: false 
      },
      ...userConfig.security
    },
    logging: {
      enabled: true,
      format: 'json',
      level: 'info',
      logRequestBody: false,
      logResponseBody: false,
      sanitizeFields: ['password', 'token', 'authorization', 'apiKey', 'secret'],
      ...userConfig.logging
    },
    metrics: {
      enabled: true,
      endpoint: '/metrics',
      collectDefaultMetrics: true,
      ...userConfig.metrics
    },
    skipPaths: ['/health', '/metrics', '/favicon.ico', ...(userConfig.skipPaths || [])],
    customLoggers: userConfig.customLoggers || []
  };

  return (req: Request, res: Response, next: NextFunction) => {
    if (config.skipPaths?.some(path => req.path === path || req.path.startsWith(path))) {
      return next();
    }

    const startTime = Date.now();

    if (config.metrics?.enabled && 
        config.metrics.endpoint && 
        req.path === config.metrics.endpoint) {
      return metricsHandler(req, res);
    }

    if (config.security?.enabled) {
      applySecurityMiddlewares(req, res, config, () => {
        setupRequestMonitoring(req, res, startTime, config);
        next();
      });
    } else {
      setupRequestMonitoring(req, res, startTime, config);
      next();
    }
  };
};

const applySecurityMiddlewares = (
  req: Request, 
  res: Response, 
  config: AuditMiddlewareConfig, 
  callback: () => void
) => {
  const securityMiddlewares = [
    ...setupSecurity(config),
    ...setupCors(config),
    ...setupRateLimit(config)
  ];

  if (securityMiddlewares.length === 0) {
    return callback();
  }

  let index = 0;
  
  const nextMiddleware = () => {
    if (index < securityMiddlewares.length) {
      const middleware = securityMiddlewares[index];
      if (middleware && typeof middleware === 'function') {
        try {
          middleware(req, res, nextMiddleware);
        } catch (error) {
          console.error('Error in security middleware:', error);
          nextMiddleware();
        }
      } else {
        nextMiddleware();
      }
      index++;
    } else {
      callback();
    }
  };

  nextMiddleware();
};

const setupRequestMonitoring = (
  req: Request, 
  res: Response, 
  startTime: number, 
  config: AuditMiddlewareConfig
): void => {
  const logger = createLogger(config);
  setupMetrics(config);

  const originalEnd = res.end;
  const originalWrite = res.write;
  const chunks: Buffer[] = [];

  if (config.logging?.logResponseBody) {
    (res as any).write = function(chunk: any, encoding?: any, callback?: any) {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
      }
      return originalWrite.call(this, chunk, encoding, callback);
    };
  }

  (res as any).end = function(chunk?: any, encoding?: any, callback?: any) {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    }

    const duration = Date.now() - startTime;
    
    if (config.metrics?.enabled) {
      collectMetrics(req, res, duration);
    }
    
    if (config.logging?.enabled) {
      let responseBody = undefined;
      
      if (config.logging.logResponseBody && chunks.length > 0) {
        try {
          const responseText = Buffer.concat(chunks).toString('utf8');
          try {
            responseBody = JSON.parse(responseText);
          } catch {
            responseBody = responseText;
          }
        } catch (error) {
          responseBody = '[Unable to parse response body]';
        }
      }
      
      logger(req, res, duration, responseBody);
    }
    
    if (config.customLoggers && config.customLoggers.length > 0) {
      config.customLoggers.forEach(customLogger => {
        try {
          customLogger(req, res, { 
            duration, 
            timestamp: new Date().toISOString(),
            startTime 
          });
        } catch (error) {
          console.error('Error in custom logger:', error);
        }
      });
    }

    return originalEnd.call(this, chunk, encoding, callback);
  };
};