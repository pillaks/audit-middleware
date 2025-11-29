const { setupSecurity } = require('../src/security/helmet');
const { setupCors } = require('../src/security/cors');
const { setupRateLimit } = require('../src/security/rate-limit');

describe('Security Modules', () => {
  let originalRequire: any;

  beforeEach(() => {
    originalRequire = jest.requireActual;
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('setupSecurity should handle missing helmet gracefully', () => {
    jest.doMock('helmet', () => {
      throw new Error('Module not found');
    }, { virtual: true });

    const config = {
      security: {
        enabled: true
      }
    };

    const middlewares = setupSecurity(config);
    expect(Array.isArray(middlewares)).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(
      'Helmet not installed. Please install helmet for security headers.'
    );
  });

  test('setupCors should handle missing cors gracefully', () => {
    jest.doMock('cors', () => {
      throw new Error('Module not found');
    }, { virtual: true });

    const config = {
      security: {
        cors: {
          enabled: true
        }
      }
    };

    const middlewares = setupCors(config);
    expect(Array.isArray(middlewares)).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(
      'CORS package not installed. Please install cors for CORS support.'
    );
  });

  test('setupRateLimit should handle missing rate-limit gracefully', () => {
    jest.doMock('express-rate-limit', () => {
      throw new Error('Module not found');
    }, { virtual: true });

    const config = {
      security: {
        rateLimit: {
          enabled: true
        }
      }
    };

    const middlewares = setupRateLimit(config);
    expect(Array.isArray(middlewares)).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(
      'express-rate-limit not installed. Please install it for rate limiting.'
    );
  });
});