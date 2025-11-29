import { RequestHandler } from 'express';

export const setupRateLimit = (config: any): RequestHandler[] => {
  const middlewares: RequestHandler[] = [];
  
  if (config.security?.rateLimit?.enabled) {
    try {
      const rateLimit = require('express-rate-limit');
      
      if (typeof rateLimit === 'function') {
        const rateLimitConfig = config.security.rateLimit;
        
        const limiter = rateLimit({
          windowMs: rateLimitConfig.windowMs || 15 * 60 * 1000,
          max: rateLimitConfig.maxRequests || 100,
          skipSuccessfulRequests: rateLimitConfig.skipSuccessfulRequests || false,
          standardHeaders: true,
          legacyHeaders: false,
          message: {
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((rateLimitConfig.windowMs || 15 * 60 * 1000) / 1000)
          }
        });
        
        middlewares.push(limiter);
      }
    } catch (error) {
      console.warn('express-rate-limit not installed. Please install it for rate limiting.');
    }
  }
  
  return middlewares;
};