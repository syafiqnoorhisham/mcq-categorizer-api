const pLimit = require('p-limit');
const { categorizeQuestion } = require('../services/claude-service');
const { logger } = require('./logger');

/**
 * Process a batch of questions in parallel
 * @param {Array} questions - Array of question objects
 * @returns {Promise<Array>} - Processed questions with categorization
 */
async function processBatch(questions) {
  // Set concurrency limit based on Claude API best practices
  // Adjust based on your API rate limits and performance testing
  const concurrencyLimit = parseInt(process.env.CONCURRENCY_LIMIT) || 4;
  const limit = pLimit(concurrencyLimit);
  
  logger.info({ 
    questionCount: questions.length, 
    concurrencyLimit 
  }, 'Processing batch of questions');
  
  const startTime = Date.now();
  
  const processPromises = questions.map(question => {
    return limit(async () => {
      try {
        const questionText = question.questions || question.question_text;
        if (!questionText) {
          throw new Error('Question text not found in question object');
        }

        const categorization = await categorizeQuestion(questionText);
        
        // Return in the expected format preserving original structure
        return {
          question_number: question.id || question.question_number,
          question_text: questionText,
          options: question.options || {},
          correct_answer: question.correct_answer || "",
          topic: categorization.topic,
          domain: categorization.domain
        };
      } catch (error) {
        logger.error({ 
          error: error.message, 
          questionId: question.id || question.question_number
        }, 'Error processing question in batch');
        
        // Return question with error indication in the expected format
        return {
          question_number: question.id || question.question_number,
          question_text: question.questions || question.question_text,
          options: question.options || {},
          correct_answer: question.correct_answer || "",
          topic: "Error",
          domain: "Error",
          error: error.message
        };
      }
    });
  });
  
  const results = await Promise.all(processPromises);
  
  const duration = Date.now() - startTime;
  logger.info({ 
    questionCount: questions.length,
    duration,
    averageTimePerQuestion: duration / questions.length
  }, 'Batch processing completed');
  
  return results;
}

module.exports = { processBatch };
