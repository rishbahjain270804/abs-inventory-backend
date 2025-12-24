const express = require('express');
const router = express.Router();
const { getNextOrderNumber } = require('../controllers/utilityController');

// GET /api/utility/next-order-number
router.get('/next-order-number', getNextOrderNumber);

module.exports = router;
