const express = require('express');
const { createAuditMiddleware } = require('audit-middleware');

const app = express();
app.use(express.json());

// Custom logger function for specific business logic
const slowRequestLogger = (req, res, data) => {
  if (data.duration > 1000) {
    console.log(`🚨 SLOW REQUEST: ${req.method} ${req.url} took ${data.duration}ms`);
  }
  
  // Log high-error endpoints
  if (res.statusCode >= 500) {
    console.log(`❌ ERROR: ${req.method} ${req.url} returned ${res.statusCode}`);
  }
};

// Advanced configuration with custom settings
app.use(createAuditMiddleware({
  security: {
    rateLimit: {
      windowMs: 10 * 60 * 1000, // 10 minute window
      maxRequests: 50, // Limit each IP to 50 requests per window
      skipSuccessfulRequests: false // Count all requests, not just successful ones
    },
    cors: {
      options: {
        origin: ['http://localhost:3000', 'https://mysite.com'], // Allowed origins
        methods: ['GET', 'POST', 'PUT'], // Allowed HTTP methods
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'] // Allowed headers
      }
    }
  },
  logging: {
    format: 'json', // Use JSON format for structured logging
    level: 'info',
    logRequestBody: true, // Log request bodies for debugging
    logResponseBody: true, // Log response bodies for debugging
    sanitizeFields: ['password', 'creditCard', 'ssn', 'apiKey'] // Hide sensitive data
  },
  metrics: {
    endpoint: '/admin/metrics', // Custom metrics endpoint path
    collectDefaultMetrics: true // Collect Node.js default metrics
  },
  skipPaths: ['/health', '/static', '/admin/health'], // Skip auditing for these paths
  customLoggers: [slowRequestLogger] // Add custom logging logic
}));

// API routes
app.get('/api/users', (req, res) => {
  res.json({ users: [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }] });
});

app.post('/api/login', (req, res) => {
  // These sensitive fields will be sanitized in logs: password, token
  res.json({ 
    token: 'jwt-secret-token-here', 
    user: { 
      id: 1, 
      name: req.body.username,
      password: 'user-password-123' // This will be hidden in logs
    } 
  });
});

app.get('/admin/metrics', (req, res) => {
  // This endpoint returns Prometheus metrics
  res.send('Prometheus metrics data would be here');
});

app.get('/health', (req, res) => {
  // This path is skipped from auditing due to skipPaths
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling route
app.get('/api/error', (req, res) => {
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(3001, () => {
  console.log('Advanced server running on http://localhost:3001');
  console.log('Try these endpoints:');
  console.log('  GET  http://localhost:3001/api/users');
  console.log('  POST http://localhost:3001/api/login');
  console.log('  GET  http://localhost:3001/admin/metrics');
  console.log('  GET  http://localhost:3001/health');
  console.log('  GET  http://localhost:3001/api/error (for error logging)');
});