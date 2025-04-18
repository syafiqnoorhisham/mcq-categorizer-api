const express = require('express');
const { validateApiKey } = require('../middleware/auth');
const { categorizeQuestion } = require('../services/claude-service');
const { processBatch } = require('../utils/batch-processor');
const { getCacheStats } = require('../services/cache-service');
const { logger } = require('../utils/logger');

const router = express.Router();

// Apply authentication to all API routes
router.use(validateApiKey);

/**
 * @route   POST /api/categorize
 * @desc    Categorize a single question
 * @access  Private
 */
router.post('/categorize', async (req, res, next) => {
  try {
    const { id, questions } = req.body;
    
    if (!questions) {
      return res.status(400).json({ error: 'Questions field is required' });
    }
    
    logger.info({ id }, 'Single question categorization request');
    const startTime = Date.now();
    
    const categorization = await categorizeQuestion(questions);
    
    const duration = Date.now() - startTime;
    logger.info({ id, duration }, 'Single question categorization completed');
    
    // Create response that preserves the original structure
    const response = {
      question_number: id,
      question_text: questions,
      options: req.body.options || {},
      correct_answer: req.body.correct_answer || "",
      topic: categorization.topic,
      domain: categorization.domain
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/categorize-batch
 * @desc    Categorize a batch of questions
 * @access  Private
 */
router.post('/categorize-batch', async (req, res, next) => {
  try {
    const questions = req.body;
    
    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: 'Request body must be an array of questions' });
    }
    
    logger.info({ questionCount: questions.length }, 'Batch categorization request');
    const startTime = Date.now();
    
    const results = await processBatch(questions);
    
    const duration = Date.now() - startTime;
    logger.info({ 
      questionCount: questions.length, 
      duration,
      averageTimePerQuestion: duration / questions.length
    }, 'Batch categorization completed');
    
    res.json(results);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/stats
 * @desc    Get API statistics
 * @access  Private
 */
router.get('/stats', (req, res) => {
  const stats = {
    cache: getCacheStats(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
  
  res.json(stats);
});

module.exports = router;
