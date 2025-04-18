const { Anthropic } = require('@anthropic-ai/sdk');
const { getCachedResult, setCachedResult } = require('./cache-service');
const { logger } = require('../utils/logger');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Claude model to use
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';

/**
 * Categorize a clinical question using Claude AI
 * @param {string} questionText - The clinical question text
 * @returns {Promise<Object>} - Topic and domain categorization
 */
async function categorizeQuestion(questionText) {
  try {
    // Check cache first
    const cachedResult = getCachedResult(questionText);
    if (cachedResult) {
      return cachedResult;
    }
    
    logger.debug({ question: questionText.substring(0, 100) + '...' }, 'Calling Claude API');
    
    // Prepare system prompt with specific categories - optimized for speed
    const systemPrompt = `Categorize medical questions by topic and domain.
    Topics: Shortness of breath, Haemoptysis, Maxillofacial injury, Cranial nerve palsy, Eye injury, Neonatal sepsis, Trauma in pregnancy, Lung volumes, Base and apex of lungs, Non-respiratory functions of lungs, Renal blood flow, Adrenal function, Pituitary function, Heart and coronary circulation, Head and neck, Electrolyte imbalance, Infectious disease, Gastrointestinal disorders, Neurology, Cardiovascular system, Hepatobiliary system, Renal system, Endocrine system, Dermatology, Musculoskeletal system
    
    Domains: Pathophysiology, Anatomy, Physiology, Pharmacology, Biochemistry, Microbiology
    
    Respond with JSON only: {"topic":"TOPIC","domain":"DOMAIN"}`;
    
    // Call Claude API
    const startTime = Date.now();
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      system: systemPrompt,
      max_tokens: 50,
      messages: [
        { role: "user", content: `Categorize: "${questionText}"` }
      ],
      temperature: 0.0,
    });
    
    const duration = Date.now() - startTime;
    logger.debug({ duration }, 'Claude API response time');
    
    // Extract categorization from response
    const categorization = extractCategorization(response);
    
    // Cache the result
    setCachedResult(questionText, categorization);
    
    return categorization;
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Error categorizing question');
    
    // Handle specific API errors
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    throw error;
  }
}

/**
 * Extract categorization from Claude response
 * @param {Object} response - Claude API response
 * @returns {Object} - Extracted topic and domain
 */
function extractCategorization(response) {
  try {
    // Extract JSON from the text response
    const content = response.content[0].text;
    // Look for JSON pattern in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("JSON not found in response");
    }
  } catch (e) {
    // Fallback parsing if JSON is malformed
    logger.warn({ error: e.message }, "Failed to parse JSON response, using fallback extraction");
    const content = response.content[0].text;
    const topicMatch = content.match(/topic["\s:]+(.*?)[\",\n]/i);
    const domainMatch = content.match(/domain["\s:]+(.*?)[\",\n]/i);
    
    return {
      topic: topicMatch ? topicMatch[1].trim() : "Unknown",
      domain: domainMatch ? domainMatch[1].trim() : "Unknown"
    };
  }
}

module.exports = { categorizeQuestion };
