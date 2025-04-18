const NodeCache = require('node-cache');
const { logger } = require('../utils/logger');

// Cache TTL in seconds (24 hours by default)
const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 86400;

// Initialize cache
const questionCache = new NodeCache({ 
  stdTTL: CACHE_TTL,
  checkperiod: 600 // Check for expired keys every 10 minutes
});

/**
 * Get cached categorization result
 * @param {string} questionText - The question text
 * @returns {Object|null} - Cached result or null
 */
function getCachedResult(questionText) {
  const key = normalizeQuestionText(questionText);
  const result = questionCache.get(key);
  
  if (result) {
    logger.debug({ questionHash: key.substring(0, 20) }, 'Cache hit');
  }
  
  return result;
}

/**
 * Set cached categorization result
 * @param {string} questionText - The question text
 * @param {Object} result - The categorization result
 */
function setCachedResult(questionText, result) {
  const key = normalizeQuestionText(questionText);
  questionCache.set(key, result);
  
  // Log cache statistics periodically
  if (questionCache.keys().length % 100 === 0) {
    logger.info({ 
      cacheSize: questionCache.keys().length,
      cacheStats: questionCache.getStats()
    }, 'Cache statistics');
  }
}

/**
 * Normalize question text for consistent cache keys
 * @param {string} text - Question text
 * @returns {string} - Normalized text
 */
function normalizeQuestionText(text) {
  // More aggressive normalization for better cache hits
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\b(a|an|the|in|on|at|to|for|with|by|of)\b/g, '') // Remove common stop words
    .trim()
    .substring(0, 200); // Limit key length for very long questions
}

/**
 * Preload cache with common categorizations
 * This can be called at startup to warm the cache
 * @param {Array} commonQuestions - Array of common questions with categorizations
 */
function preloadCache(commonQuestions) {
  if (!Array.isArray(commonQuestions) || commonQuestions.length === 0) {
    return;
  }
  
  logger.info(`Preloading cache with ${commonQuestions.length} items`);
  
  commonQuestions.forEach(item => {
    if (item.question_text && item.topic && item.domain) {
      setCachedResult(item.question_text, {
        topic: item.topic,
        domain: item.domain
      });
    }
  });
  
  logger.info(`Cache preloaded with ${questionCache.keys().length} items`);
}

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
function getCacheStats() {
  return {
    size: questionCache.keys().length,
    stats: questionCache.getStats()
  };
}

module.exports = {
  getCachedResult,
  setCachedResult,
  getCacheStats,
  preloadCache
};
