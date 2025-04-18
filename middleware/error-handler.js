const { logger } = require('../utils/logger');

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  // Log the error
  logger.error({ 
    err, 
    requestId: req.id,
    path: req.path,
    method: req.method
  }, 'Request error');
  
  // Set status code
  const statusCode = err.statusCode || 500;
  
  // Determine error message based on environment
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected error occurred'
    : err.message;
  
  // Send error response
  res.status(statusCode).json({
    error: true,
    message,
    requestId: req.id
  });
}

module.exports = errorHandler;
