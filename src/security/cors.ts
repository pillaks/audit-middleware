import { RequestHandler } from 'express';

export const setupCors = (config: any): RequestHandler[] => {
  const middlewares: RequestHandler[] = [];
  
  if (config.security?.cors?.enabled) {
    try {
      const cors = require('cors');
      
      if (typeof cors === 'function') {
        const corsOptions = config.security.cors.options || {
          origin: '*',
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          allowedHeaders: ['Content-Type', 'Authorization'],
          credentials: false,
          maxAge: 86400
        };
        
        middlewares.push(cors(corsOptions));
      }
    } catch (error) {
      console.warn('CORS package not installed. Please install cors for CORS support.');
    }
  }
  
  return middlewares;
};