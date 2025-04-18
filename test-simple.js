const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000';
const API_KEY = '1234567890abcdef'; // This should match the API_KEY in your .env file

// Sample question from the dataset
const sampleQuestion = {
  question_number: 1,
  question_text: "A 55-year-old woman with no past medical history presented with recurrent chest pains with the latest pain onset was 6 hours prior and lasted for 30 minutes. Occasionally she felt it as burning-like sensation. Vital signs were BP 140/80 mmHg, HR 90/min, RR 16/min, and SpO2 99% on room air. 12-lead ECG demonstrates sinus rhythm, no ST elevations, and a presence of isolated ST segment depression in a high lateral lead. High sensitivity troponin result is pending.",
  options: {
    "A": "Air enters the pleural space from the lung via mediastinal tissue planes",
    "B": "Defect in esophageal mucosal defense against the refluxate occurs",
    "C": "Increased in metabolic demands leading to mismatch in oxygen supply",
    "D": "Lack of oxygen supply to the myocardium by thrombus formation",
    "E": "Tear in intima media of the aorta leads to formation of new lumen"
  },
  correct_answer: "D"
};

// Function to test the API
async function testAPI() {
  try {
    console.log('Testing the MCQ Categorizer API...');
    console.log('Endpoint: POST', `${API_URL}/api/categorize`);
    console.log('API Key:', API_KEY);
    console.log('Sample Question ID:', sampleQuestion.question_number);
    console.log('Sample Question Text (first 100 chars):', sampleQuestion.question_text.substring(0, 100) + '...');
    
    // Make the API request
    console.log('\nSending request...');
    const response = await axios.post(
      `${API_URL}/api/categorize`,
      sampleQuestion,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY
        }
      }
    );
    
    // Log the response
    console.log('\nResponse Status:', response.status);
    console.log('Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\nAPI test completed successfully!');
  } catch (error) {
    console.error('\nError testing API:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
      
      if (error.response.status === 401) {
        console.error('\nAuthentication Error: Make sure your API key matches the one in the .env file.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Is the server running?');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
}

// Run the test
testAPI();
