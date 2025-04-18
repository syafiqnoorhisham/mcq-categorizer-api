const pino = require('pino');

// Configure logger based on environment
const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  transport: process.env.NODE_ENV !== 'production' 
    ? { target: 'pino-pretty' } 
    : undefined,
  redact: {
    paths: ['req.headers.authorization', 'req.headers["x-api-key"]'],
    censor: '[REDACTED]'
  }
});

module.exports = { logger };
