const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'http://localhost:3000';
const API_KEY = '1234567890abcdef'; // This should match the API_KEY in your .env file
const SAMPLE_DATA_PATH = '../parsed_mcq_questions.json';
const BATCH_SIZES = [10, 20, 50, 100]; // Different batch sizes to test

// Setup axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  }
});

/**
 * Test batch processing with different batch sizes
 */
async function runPerformanceTests() {
  try {
    console.log('=== MCQ Categorizer API Performance Test ===');
    console.log(`API URL: ${API_URL}`);
    console.log('Testing batch processing with different batch sizes...\n');
    
    // Read sample data
    const sampleQuestionsPath = path.resolve(__dirname, SAMPLE_DATA_PATH);
    console.log(`Loading sample questions from ${sampleQuestionsPath}`);
    
    if (!fs.existsSync(sampleQuestionsPath)) {
      console.error(`Error: Sample data file not found at ${sampleQuestionsPath}`);
      return;
    }
    
    const sampleQuestions = JSON.parse(fs.readFileSync(sampleQuestionsPath, 'utf8'));
    console.log(`Loaded ${sampleQuestions.length} sample questions\n`);
    
    // Run tests with different batch sizes
    const results = [];
    
    for (const batchSize of BATCH_SIZES) {
      // Skip if batch size is larger than available questions
      if (batchSize > sampleQuestions.length) {
        console.log(`Skipping batch size ${batchSize} (not enough sample questions)`);
        continue;
      }
      
      // Prepare batch
      const batch = sampleQuestions.slice(0, batchSize);
      
      console.log(`Testing batch size: ${batchSize} questions...`);
      
      // Make API request
      const startTime = Date.now();
      const response = await api.post('/api/categorize-batch', batch);
      const duration = Date.now() - startTime;
      
      // Calculate metrics
      const avgTimePerQuestion = duration / batchSize;
      
      // Store results
      results.push({
        batchSize,
        totalTime: duration,
        avgTimePerQuestion,
        questionsPerSecond: 1000 / avgTimePerQuestion
      });
      
      // Log results
      console.log(`  Total time: ${duration}ms`);
      console.log(`  Avg time per question: ${avgTimePerQuestion.toFixed(2)}ms`);
      console.log(`  Questions per second: ${(1000 / avgTimePerQuestion).toFixed(2)}`);
      console.log(`  First result: ${response.data[0].topic} / ${response.data[0].domain}\n`);
    }
    
    // Print summary
    console.log('=== Performance Test Summary ===');
    console.table(results.map(r => ({
      'Batch Size': r.batchSize,
      'Total Time (ms)': r.totalTime,
      'Avg Time/Question (ms)': r.avgTimePerQuestion.toFixed(2),
      'Questions/Second': r.questionsPerSecond.toFixed(2)
    })));
    
    // Check if performance meets requirements
    const largestBatch = results[results.length - 1];
    if (largestBatch.batchSize >= 50 && largestBatch.totalTime < 10000) {
      console.log('\n✅ Performance meets requirements! (< 10 seconds for 50+ questions)');
    } else if (largestBatch.batchSize >= 50 && largestBatch.totalTime < 5000) {
      console.log('\n🚀 Performance exceeds requirements! (< 5 seconds for 50+ questions)');
    } else {
      console.log('\n⚠️ Performance may need further optimization to meet requirements.');
    }
    
  } catch (error) {
    console.error('\nError running performance tests:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
    } else {
      console.error('Error message:', error.message);
    }
  }
}

// Run the performance tests
runPerformanceTests();
