const { createAuditMiddleware } = require('../src/middleware');

test('debug - check what happens in middleware', () => {
  const middleware = createAuditMiddleware({
    security: {
      enabled: false
    },
    logging: {
      enabled: false
    },
    metrics: {
      enabled: false
    }
  });
  
  expect(typeof middleware).toBe('function');
  
  const mockReq = {
    path: '/test',
    method: 'GET'
  };
  
  const mockRes = {
    end: jest.fn(),
    on: jest.fn()
  };
  
  const mockNext = jest.fn();

  middleware(mockReq, mockRes, mockNext);
  
  expect(mockNext).toHaveBeenCalled();
});