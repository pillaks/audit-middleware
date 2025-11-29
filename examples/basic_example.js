const express = require('express');
const { createAuditMiddleware } = require('audit-middleware');

const app = express();
app.use(express.json());

// Basic usage with all features enabled by default
app.use(createAuditMiddleware());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!', timestamp: new Date().toISOString() });
});

app.post('/users', (req, res) => {
  // Password will be sanitized in logs due to default sanitizeFields
  res.json({ 
    id: Math.random().toString(36).substr(2, 9),
    name: req.body.name,
    email: req.body.email,
    password: 'should-be-hidden-in-logs'
  });
});

app.get('/health', (req, res) => {
  // This path is skipped from auditing due to default skipPaths
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/metrics', (req, res) => {
  // This path is handled by metrics handler, not regular auditing
  res.send('Prometheus metrics would be here');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('Try these endpoints:');
  console.log('  GET  http://localhost:3000/');
  console.log('  POST http://localhost:3000/users');
  console.log('  GET  http://localhost:3000/health');
  console.log('  GET  http://localhost:3000/metrics');
});