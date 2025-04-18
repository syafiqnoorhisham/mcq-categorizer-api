require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000';
const API_KEY = process.env.API_KEY || 'your-api-key-here';
const SAMPLE_DATA_PATH = '../parsed_mcq_questions.json';

// Setup axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  }
});

/**
 * Test single question categorization
 */
async function testSingleQuestion() {
  try {
    console.log('Testing single question categorization...');
    
    // Read sample data
    const sampleData = JSON.parse(fs.readFileSync(path.resolve(__dirname, SAMPLE_DATA_PATH), 'utf8'));
    const sampleQuestion = sampleData[0];
    
    // Format request
    const requestData = {
      id: sampleQuestion.question_number,
      questions: sampleQuestion.question_text
    };
    
    console.log(`\nSending question: ${requestData.id}`);
    console.log(`Question text: ${requestData.questions.substring(0, 100)}...`);
    
    // Make API request
    const startTime = Date.now();
    const response = await api.post('/api/categorize', requestData);
    const duration = Date.now() - startTime;
    
    console.log(`\nResponse (${duration}ms):`);
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error testing single question:', error.response?.data || error.message);
  }
}

/**
 * Test batch question categorization
 */
async function testBatchQuestions(count = 5) {
  try {
    console.log(`\nTesting batch question categorization (${count} questions)...`);
    
    // Read sample data
    const sampleData = JSON.parse(fs.readFileSync(path.resolve(__dirname, SAMPLE_DATA_PATH), 'utf8'));
    const batchQuestions = sampleData.slice(0, count).map(q => ({
      id: q.question_number,
      questions: q.question_text
    }));
    
    console.log(`\nSending ${batchQuestions.length} questions for batch processing...`);
    
    // Make API request
    const startTime = Date.now();
    const response = await api.post('/api/categorize-batch', batchQuestions);
    const duration = Date.now() - startTime;
    
    console.log(`\nResponse (${duration}ms):`);
    console.log(`Average time per question: ${Math.round(duration / count)}ms`);
    
    // Print first result as example
    console.log('\nFirst result:');
    console.log(JSON.stringify(response.data[0], null, 2));
    
    console.log(`\nProcessed ${response.data.length} questions successfully.`);
    
    return response.data;
  } catch (error) {
    console.error('Error testing batch questions:', error.response?.data || error.message);
  }
}

/**
 * Test API stats endpoint
 */
async function testApiStats() {
  try {
    console.log('\nTesting API stats endpoint...');
    
    const response = await api.get('/api/stats');
    
    console.log('\nAPI Stats:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error testing API stats:', error.response?.data || error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    // Check if API is running
    const health = await api.get('/health');
    console.log('API Health Check:', health.data);
    
    // Run tests
    await testSingleQuestion();
    await testBatchQuestions(3);
    await testApiStats();
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('\nError running tests:', error.message);
    console.log('\nMake sure the API server is running on', API_URL);
  }
}

// Run tests
runTests();
