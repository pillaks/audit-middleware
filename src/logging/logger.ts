import { Request, Response } from 'express';

export const createLogger = (config: any) => {
  return (req: Request, res: Response, duration: number, responseBody?: any) => {
    const logData: any = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent') || 'Unknown',
      ip: req.ip || req.connection.remoteAddress,
      referrer: req.get('Referer') || 'Direct'
    };

    if (config.logging?.logRequestBody && req.body) {
      logData.requestBody = sanitizeData(req.body, config.logging.sanitizeFields);
    }

    if (responseBody !== undefined) {
      logData.responseBody = sanitizeData(responseBody, config.logging.sanitizeFields);
    }

    config.logging?.sanitizeFields?.forEach((field: string) => {
      if (logData[field]) {
        logData[field] = '***';
      }
    });

    if (config.logging?.format === 'json') {
      console.log(JSON.stringify(logData));
    } else {
      console.log(`${logData.timestamp} ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
    }
  };
};

const sanitizeData = (data: any, sanitizeFields: string[] = []): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item, sanitizeFields));
  }

  const sanitized: any = { ...data };
  sanitizeFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***';
    }
  });

  return sanitized;
};