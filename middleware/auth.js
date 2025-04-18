const { logger } = require('../utils/logger');

/**
 * Validate API key middleware
 */
function validateApiKey(req, res, next) {
  // Skip in development mode if API_KEY is not set
  if (process.env.NODE_ENV === 'development' && !process.env.API_KEY) {
    logger.warn('API key validation skipped in development mode');
    return next();
  }
  
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    logger.warn({ ip: req.ip }, 'Unauthorized API access attempt');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
}

module.exports = { validateApiKey };
