const { createLogger } = require('../src/logging/logger');

describe('Logging', () => {
  let mockConsoleLog: any;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  test('should log in JSON format', () => {
    const config = {
      logging: {
        format: 'json'
      }
    };

    const mockReq = {
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
      get: (header: string) => {
        if (header === 'User-Agent') return 'jest-test';
        if (header === 'Referer') return 'http://test.com';
        return null;
      }
    };

    const mockRes = {
      statusCode: 200,
      get: () => null
    };

    const logger = createLogger(config);
    logger(mockReq, mockRes, 150);

    expect(mockConsoleLog).toHaveBeenCalledTimes(1);
    
    const logOutput = mockConsoleLog.mock.calls[0][0];
    const logData = JSON.parse(logOutput);
    
    expect(logData.method).toBe('GET');
    expect(logData.url).toBe('/test');
    expect(logData.statusCode).toBe(200);
  });
});