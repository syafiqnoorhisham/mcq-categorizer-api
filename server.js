require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const pinoHttp = require('pino-http');
const fs = require('fs');
const path = require('path');
const { logger } = require('./utils/logger');
const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');
const { preloadCache } = require('./services/cache-service');
const { categorizeQuestion } = require('./services/claude-service');

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(pinoHttp({ 
  logger,
  genReqId: (req) => req.headers['x-request-id'] || require('crypto').randomUUID()
}));

// Routes
app.use('/', routes);

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Claude Model: ${process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20240620'}`);
  
  // Preload cache with sample questions
  try {
    const sampleQuestionsPath = path.resolve(__dirname, '../parsed_mcq_questions.json');
    if (fs.existsSync(sampleQuestionsPath)) {
      logger.info(`Loading sample questions from ${sampleQuestionsPath}`);
      const sampleQuestions = JSON.parse(fs.readFileSync(sampleQuestionsPath, 'utf8'));
      
      // Process a subset of questions to warm the cache
      const questionsToPreload = sampleQuestions.slice(0, 10);
      
      // Preload cache asynchronously
      (async () => {
        logger.info('Preloading cache with sample questions...');
        for (const question of questionsToPreload) {
          try {
            const categorization = await categorizeQuestion(question.question_text);
            logger.info(`Cached question ${question.question_number}: ${categorization.topic} / ${categorization.domain}`);
          } catch (error) {
            logger.error({ error: error.message }, `Error preloading question ${question.question_number}`);
          }
        }
        logger.info('Cache preloading completed');
      })();
    } else {
      logger.warn(`Sample questions file not found at ${sampleQuestionsPath}`);
    }
  } catch (error) {
    logger.error({ error: error.message }, 'Error preloading cache');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled Promise Rejection');
  // In production, we might want to exit and let the process manager restart
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

module.exports = app; // For testing
