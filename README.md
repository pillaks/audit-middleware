# Audit Middleware for Express.js

[![npm version](https://img.shields.io/npm/v/audit-middleware.svg)](https://www.npmjs.com/package/audit-middleware)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

All-in-one security and observability middleware for Express.js applications. Provides security headers, CORS, rate limiting, structured logging, and Prometheus metrics in a single middleware.

## ✨ Features

- 🔒 **Security** - Helmet, CORS, Rate Limiting (optional)
- 📊 **Logging** - Structured JSON or simple format with sensitive data sanitization  
- 📈 **Metrics** - Prometheus metrics with customizable endpoint
- ⚡ **Zero-config** - Works out of the box with sensible defaults
- 🔧 **Flexible** - Enable/disable features as needed
- 📝 **TypeScript** - Fully typed
- 🛡️ **Safe** - Graceful degradation when optional dependencies missing

## 🚀 Installation

```bash
npm install audit-middleware
```

## 💻 Quick Start

```javascript
const express = require('express');
const { createAuditMiddleware } = require('audit-middleware');

const app = express();
app.use(express.json());

// Use with default configuration
app.use(createAuditMiddleware());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.post('/users', (req, res) => {
  res.json({ 
    id: 1, 
    name: req.body.name,
    email: req.body.email
  });
});

app.listen(3000);
```

## ⚙️ Configuration

```javascript
app.use(createAuditMiddleware({
  security: {
    enabled: true,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // limit each IP to 100 requests per window
      skipSuccessfulRequests: false
    },
    cors: {
      enabled: true,
      options: {
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT']
      }
    }
  },
  logging: {
    enabled: true,
    format: 'json', // 'json' or 'simple'
    level: 'info',
    logRequestBody: false,
    logResponseBody: false,
    sanitizeFields: ['password', 'token', 'authorization'] // fields to hide in logs
  },
  metrics: {
    enabled: true,
    endpoint: '/metrics', // metrics endpoint path
    collectDefaultMetrics: true
  },
  skipPaths: ['/health', '/metrics'], // paths to skip auditing
  customLoggers: [
    (req, res, data) => {
      // Your custom logging logic
      if (data.duration > 1000) {
        console.log(`Slow request: ${req.method} ${req.url}`);
      }
    }
  ]
}));
```

## 📦 Optional Dependencies

Install only what you need:

```bash
# Security features (helmet, CORS, rate limiting)
npm install helmet cors express-rate-limit

# Metrics (Prometheus)
npm install prom-client
```

Without these packages, the corresponding features will be automatically disabled.

## 🔧 API

### createAuditMiddleware(config?)

Creates an Express middleware with comprehensive auditing capabilities.

**Parameters:**
- `config` - Optional configuration object

**Returns:**
- Express middleware function

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `security.enabled` | boolean | `true` | Enable security features |
| `security.helmet` | object | `{}` | Helmet configuration |
| `security.cors.enabled` | boolean | `true` | Enable CORS |
| `security.cors.options` | object | `{}` | CORS options |
| `security.rateLimit.enabled` | boolean | `true` | Enable rate limiting |
| `security.rateLimit.windowMs` | number | `900000` | Rate limit window (15 min) |
| `security.rateLimit.maxRequests` | number | `100` | Max requests per window |
| `logging.enabled` | boolean | `true` | Enable request logging |
| `logging.format` | string | `'json'` | Log format: 'json' or 'simple' |
| `logging.sanitizeFields` | string[] | `['password', 'token']` | Fields to hide in logs |
| `metrics.enabled` | boolean | `true` | Enable Prometheus metrics |
| `metrics.endpoint` | string | `'/metrics'` | Metrics endpoint path |
| `skipPaths` | string[] | `['/health', '/metrics']` | Paths to skip auditing |

## 📚 Examples

### Basic Usage
```javascript
app.use(createAuditMiddleware());
```

### Security Only
```javascript
app.use(createAuditMiddleware({
  logging: { enabled: false },
  metrics: { enabled: false }
}));
```

### Production Setup
```javascript
app.use(createAuditMiddleware({
  security: {
    rateLimit: { maxRequests: 50 }
  },
  logging: {
    format: 'json',
    sanitizeFields: ['password', 'token', 'apiKey']
  },
  skipPaths: ['/health', '/ready', '/metrics']
}));
```

### Custom Logging
```javascript
app.use(createAuditMiddleware({
  customLoggers: [
    (req, res, data) => {
      if (res.statusCode >= 400) {
        console.log(`Error ${res.statusCode}: ${req.method} ${req.url}`);
      }
    }
  ]
}));
```

## 🎯 Use Cases

### Development
- Automatic request logging
- Security headers during development
- Easy debugging with structured logs

### Production
- Rate limiting to prevent abuse
- CORS configuration for your frontend
- Prometheus metrics for monitoring
- Sensitive data protection in logs

### Microservices
- Consistent auditing across services
- Standardized security configuration
- Centralized metrics collection

## 🔍 How It Works

The middleware wraps your Express application and provides:

1. **Security Layer** - Applies helmet, CORS, and rate limiting
2. **Request Monitoring** - Tracks request duration and metadata
3. **Response Interception** - Captures response data for logging
4. **Metrics Collection** - Gathers Prometheus metrics
5. **Structured Logging** - Outputs consistent log formats

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License


This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/pillaks/audit-middleware)
- [npm Package](https://www.npmjs.com/package/audit-middleware)
- [Report Bug](https://github.com/pillaks/audit-middleware/issues)

---

**Ready to secure and monitor your Express app?** Install now and get started in seconds! 🚀