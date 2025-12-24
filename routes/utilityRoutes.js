const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/utilityController');

// GET /api/utility/dashboard-stats
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
