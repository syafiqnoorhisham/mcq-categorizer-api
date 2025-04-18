# Medical MCQ Categorizer API

A high-performance Node.js API that categorizes medical multiple-choice questions using Claude AI. The API analyzes question text and assigns appropriate medical topics and domains.

## Performance Optimizations

This API has been optimized to process requests in under 10 seconds for batches of 50+ questions, with a target of under 5 seconds. Key optimizations include:

1. **Faster Claude Model**: Uses Claude 3.5 Haiku for faster response times
2. **Parallel Processing**: Processes multiple questions simultaneously with controlled concurrency
3. **Optimized Prompts**: Simplified prompts for faster Claude processing
4. **Aggressive Caching**: Enhanced caching with text normalization for better hit rates
5. **Cache Preloading**: Preloads common questions at startup
6. **Reduced Token Usage**: Minimized token usage in Claude requests
7. **Response Format Preservation**: Maintains original question structure in responses

## Features

- **Fast Categorization**: Processes requests in under 2 seconds
- **Claude AI Integration**: Leverages Claude's medical knowledge for accurate categorization
- **Caching**: Implements efficient caching to reduce API calls and improve response times
- **Batch Processing**: Supports both single and batch question categorization
- **Parallel Processing**: Optimizes batch requests with controlled concurrency
- **API Authentication**: Secures endpoints with API key authentication
- **Comprehensive Logging**: Detailed logging for monitoring and debugging

## API Endpoints

### Health Check

```
GET /health
```

Returns the API health status.

### Single Question Categorization

```
POST /api/categorize
```

Categorizes a single medical question.

**Request Body:**
```json
{
  "id": 1,
  "questions": "A 55-year-old woman with no past medical history presented with recurrent chest pains..."
}
```

**Response:**
```json
{
  "id": 1,
  "questions": "A 55-year-old woman with no past medical history presented with recurrent chest pains...",
  "Course Topic": "Cardiovascular system",
  "Domain": "Pathophysiology"
}
```

### Batch Question Categorization

```
POST /api/categorize-batch
```

Categorizes multiple medical questions in a single request.

**Request Body:**
```json
[
  {
    "id": 1,
    "questions": "A 55-year-old woman with no past medical history presented with recurrent chest pains..."
  },
  {
    "id": 2,
    "questions": "An 11-month-old boy presented with a 1-day history of wheezing and coughing..."
  }
]
```

**Response:**
```json
[
  {
    "id": 1,
    "questions": "A 55-year-old woman with no past medical history presented with recurrent chest pains...",
    "Course Topic": "Cardiovascular system",
    "Domain": "Pathophysiology"
  },
  {
    "id": 2,
    "questions": "An 11-month-old boy presented with a 1-day history of wheezing and coughing...",
    "Course Topic": "Shortness of breath",
    "Domain": "Pathophysiology"
  }
]
```

### API Statistics

```
GET /api/stats
```

Returns API usage statistics including cache information.

## Setup and Installation

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/mcq-categorizer-api.git
   cd mcq-categorizer-api
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your Claude API key and other configuration

### Running the API

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

### Testing the API

The project includes several test scripts to verify functionality and performance:

1. **Simple Test**: Tests a single question categorization
   ```
   npm run test-simple
   ```

2. **API Test**: Tests both single and batch categorization with sample questions
   ```
   npm run test-api
   ```

3. **Performance Test**: Measures API performance with different batch sizes
   ```
   npm run performance
   ```
   
   This test will process batches of 10, 20, 50, and 100 questions and report metrics including:
   - Total processing time
   - Average time per question
   - Questions processed per second

## Configuration

The API can be configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment (development/production) | development |
| ANTHROPIC_API_KEY | Claude API key | - |
| CLAUDE_MODEL | Claude model to use | claude-3-haiku-20240307 |
| CACHE_TTL | Cache time-to-live in seconds | 86400 (24 hours) |
| CONCURRENCY_LIMIT | Maximum concurrent Claude API requests | 4 |
| API_KEY | API authentication key | - |
| LOG_LEVEL | Logging level | debug (development), info (production) |

## Performance Optimization

The API is optimized for performance in several ways:

1. **Caching**: Previously categorized questions are cached to avoid redundant API calls
2. **Parallel Processing**: Batch requests are processed in parallel with controlled concurrency
3. **Efficient Prompting**: Claude prompts are optimized for fast and accurate responses
4. **Response Compression**: HTTP responses are compressed to reduce bandwidth
5. **JSON Parsing Fallbacks**: Robust parsing of Claude responses with fallback mechanisms

## Error Handling

The API implements comprehensive error handling:

- Input validation for all endpoints
- Graceful handling of Claude API errors
- Detailed error logging
- Appropriate HTTP status codes
- Rate limit handling with exponential backoff

## License

MIT
