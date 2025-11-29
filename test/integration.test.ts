const request = require('supertest');
const express = require('express');

const { createAuditMiddleware } = require('../src/middleware');

describe('Integration Tests', () => {
  test('should process request with security disabled', async () => {
    const app = express();
    app.use(express.json());
    
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Error in test:', err);
      res.status(500).json({ error: err.message });
    });
    
    app.use(createAuditMiddleware({
      security: {
        enabled: false
      },
      logging: {
        enabled: false
      },
      metrics: {
        enabled: false
      }
    }));
    
    app.get('/test', (req: any, res: any) => {
      res.json({ message: 'success' });
    });

    const response = await request(app)
      .get('/test')
      .expect(200);

    expect(response.body).toEqual({ message: 'success' });
  });

  test('should skip paths in skipPaths', async () => {
    const app = express();
    
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Error in skipPaths test:', err);
      res.status(500).json({ error: err.message });
    });
    
    app.use(createAuditMiddleware({
      security: {
        enabled: false
      },
      logging: {
        enabled: false
      },
      metrics: {
        enabled: false
      },
      skipPaths: ['/health', '/metrics']
    }));
    
    app.get('/health', (req: any, res: any) => {
      res.json({ status: 'ok' });
    });

    app.get('/api/test', (req: any, res: any) => {
      res.json({ api: 'test' });
    });

    const healthResponse = await request(app)
      .get('/health')
      .expect(200);

    const apiResponse = await request(app)
      .get('/api/test')
      .expect(200);

    expect(healthResponse.body).toEqual({ status: 'ok' });
    expect(apiResponse.body).toEqual({ api: 'test' });
  });

  test('should handle POST requests with body', async () => {
    const app = express();
    app.use(express.json());
    
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Error in POST test:', err);
      res.status(500).json({ error: err.message });
    });
    
    app.use(createAuditMiddleware({
      security: {
        enabled: false
      },
      logging: {
        enabled: false
      },
      metrics: {
        enabled: false
      }
    }));
    
    app.post('/users', (req: any, res: any) => {
      res.json({ 
        id: 1, 
        name: req.body.name 
      });
    });

    const response = await request(app)
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(200);

    expect(response.body).toEqual({
      id: 1,
      name: 'John Doe'
    });
  });

  test('should work with logging enabled', async () => {
    const app = express();
    
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Error in logging test:', err);
      res.status(500).json({ error: err.message });
    });
    
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    app.use(createAuditMiddleware({
      security: {
        enabled: false
      },
      logging: {
        enabled: true,
        format: 'simple'
      },
      metrics: {
        enabled: false
      }
    }));
    
    app.get('/log-test', (req: any, res: any) => {
      res.json({ logged: true });
    });

    const response = await request(app)
      .get('/log-test')
      .expect(200);

    expect(response.body).toEqual({ logged: true });
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('should handle custom loggers', async () => {
    const app = express();
    
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Error in custom logger test:', err);
      res.status(500).json({ error: err.message });
    });
    
    const customLogger = jest.fn();
    
    app.use(createAuditMiddleware({
      security: {
        enabled: false
      },
      logging: {
        enabled: false
      },
      metrics: {
        enabled: false
      },
      customLoggers: [customLogger]
    }));
    
    app.get('/custom-log', (req: any, res: any) => {
      res.json({ custom: true });
    });

    await request(app)
      .get('/custom-log')
      .expect(200);

    await new Promise(resolve => setTimeout(resolve, 50));
    expect(customLogger).toHaveBeenCalled();
  });

  test('should handle error responses', async () => {
    const app = express();
    
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Error in error test:', err);
      res.status(500).json({ error: err.message });
    });
    
    app.use(createAuditMiddleware({
      security: {
        enabled: false
      },
      logging: {
        enabled: false
      },
      metrics: {
        enabled: false
      }
    }));
    
    app.get('/server-error', (req: any, res: any) => {
      res.status(500).json({ error: 'Internal Server Error' });
    });

    const response = await request(app)
      .get('/server-error')
      .expect(500);

    expect(response.body).toEqual({ error: 'Internal Server Error' });
  });
});