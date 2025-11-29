import { Request, Response } from 'express';

let client: any;
let httpRequestDuration: any;
let httpRequestsTotal: any;
let httpRequestSize: any;
let httpResponseSize: any;

export const setupMetrics = (config: any) => {
  try {
    client = require('prom-client');
    
    if (config.metrics?.collectDefaultMetrics) {
      client.collectDefaultMetrics();
    }

    httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in ms',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000]
    });

    httpRequestsTotal = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });

    httpRequestSize = new client.Histogram({
      name: 'http_request_size_bytes',
      help: 'HTTP request size in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 500, 1000, 5000, 10000, 50000]
    });

    httpResponseSize = new client.Histogram({
      name: 'http_response_size_bytes',
      help: 'HTTP response size in bytes',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [100, 500, 1000, 5000, 10000, 50000, 100000]
    });

    return {
      register: client.register,
      metrics: {
        httpRequestDuration,
        httpRequestsTotal,
        httpRequestSize,
        httpResponseSize
      }
    };
  } catch (error) {
    console.warn('prom-client not installed. Metrics will be disabled.');
    return { register: null, metrics: null };
  }
};

export const collectMetrics = (req: Request, res: Response, duration: number) => {
  if (!httpRequestDuration) return;

  const route = req.route?.path || req.path;
  const method = req.method;
  const statusCode = res.statusCode.toString();

  try {
    httpRequestDuration.labels(method, route, statusCode).observe(duration);
    httpRequestsTotal.labels(method, route, statusCode).inc();
    
    const contentLength = req.get('content-length');
    if (contentLength) {
      httpRequestSize.labels(method, route).observe(parseInt(contentLength));
    }
    
    const responseContentLength = res.get('content-length');
    if (responseContentLength) {
      httpResponseSize.labels(method, route, statusCode).observe(parseInt(responseContentLength));
    }
  } catch (error) {
    console.error('Error collecting metrics:', error);
  }
};

export const metricsHandler = async (req: Request, res: Response): Promise<void> => {
  if (!client) {
    res.status(500).send('Metrics are disabled. Install prom-client to enable.');
    return;
  }

  try {
    res.set('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
  } catch (error) {
    res.status(500).send('Error generating metrics');
  }
};