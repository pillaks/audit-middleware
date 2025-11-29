const { setupMetrics, collectMetrics, metricsHandler } = require('../src/metrics/collector');

const mockObserve = jest.fn();
const mockInc = jest.fn();
const mockLabels = jest.fn(() => ({
  observe: mockObserve,
  inc: mockInc
}));

jest.mock('prom-client', () => ({
  collectDefaultMetrics: jest.fn(),
  Counter: jest.fn(() => ({
    inc: mockInc,
    labels: mockLabels
  })),
  Histogram: jest.fn(() => ({
    observe: mockObserve,
    labels: mockLabels
  })),
  register: {
    contentType: 'text/plain',
    metrics: jest.fn(async () => 'mock_metrics_data')
  }
}));

describe('Metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('setupMetrics should initialize metrics', () => {
    const config = {
      metrics: {
        enabled: true
      }
    };

    const result = setupMetrics(config);
    expect(result).toHaveProperty('register');
  });

  test('collectMetrics should work without errors', () => {
    const mockReq = {
      method: 'GET',
      path: '/test',
      route: { path: '/test' },
      get: () => '456'
    };

    const mockRes = {
      statusCode: 200,
      get: () => '789'
    };

    const config = {
      metrics: {
        enabled: true
      }
    };

    setupMetrics(config);
    collectMetrics(mockReq, mockRes, 150);

    expect(true).toBe(true);
  });

  test('metricsHandler should return metrics', async () => {
    const mockReq = {};
    const mockRes = {
      set: jest.fn(),
      send: jest.fn()
    };

    const config = {
      metrics: {
        enabled: true
      }
    };

    setupMetrics(config);
    await metricsHandler(mockReq, mockRes);

    expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'text/plain');
    expect(mockRes.send).toHaveBeenCalledWith('mock_metrics_data');
  });
});