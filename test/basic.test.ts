const { createAuditMiddleware } = require('../src/middleware');

describe('Basic Audit Middleware Tests', () => {
  test('should create middleware function', () => {
    const middleware = createAuditMiddleware();
    expect(typeof middleware).toBe('function');
    expect(middleware.length).toBe(3);
  });

  test('should accept configuration object', () => {
    const config = {
      security: {
        enabled: false
      }
    };
    
    const middleware = createAuditMiddleware(config);
    expect(typeof middleware).toBe('function');
  });
});