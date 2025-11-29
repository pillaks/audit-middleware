import { RequestHandler } from 'express';

export const setupSecurity = (config: any): RequestHandler[] => {
  const middlewares: RequestHandler[] = [];
  
  if (config.security?.enabled) {
    try {
      const helmet = require('helmet');
      
      if (typeof helmet === 'function') {
        middlewares.push(helmet(config.security.helmet));
        
        if (!config.security.helmet?.contentSecurityPolicy) {
          if (typeof helmet.contentSecurityPolicy === 'function') {
            middlewares.push(helmet.contentSecurityPolicy({
              directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
              }
            }));
          }
        }
      }
    } catch (error) {
      console.warn('Helmet not installed. Please install helmet for security headers.');
    }
  }
  
  return middlewares;
};