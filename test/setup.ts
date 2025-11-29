jest.mock('prom-client', () => ({
  collectDefaultMetrics: jest.fn(),
  Counter: jest.fn(() => ({
    inc: jest.fn(),
    labels: jest.fn(() => ({ inc: jest.fn() }))
  })),
  Histogram: jest.fn(() => ({
    observe: jest.fn(),
    labels: jest.fn(() => ({ observe: jest.fn() }))
  })),
  register: {
    contentType: 'text/plain',
    metrics: jest.fn(async () => 'mock_metrics')
  }
}));