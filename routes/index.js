const express = require('express');
const apiRoutes = require('./api');

const router = express.Router();

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'mcq-categorizer-api',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/api', apiRoutes);

// 404 handler
router.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = router;
