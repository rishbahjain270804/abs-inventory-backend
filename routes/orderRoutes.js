const express = require('express');
const router = express.Router();

const {
  createBulkOrder,
  getOrderWithItems,
  getAllOrdersWithItemCount,
  updateBulkOrder,
  deleteBulkOrder
} = require('../controllers/bulkOrderController');

// Standard RESTful routes mapped to bulk controller
router.get('/', getAllOrdersWithItemCount);
router.get('/:id', getOrderWithItems);
router.post('/', createBulkOrder);
router.put('/:id', updateBulkOrder);
router.delete('/:id', deleteBulkOrder);

// Explicit routes for clarity (frontend uses these too)
router.post('/bulk', createBulkOrder);
router.put('/bulk/:id', updateBulkOrder);
router.delete('/bulk/:id', deleteBulkOrder);
router.get('/with-items/all', getAllOrdersWithItemCount);
router.get('/with-items/:id', getOrderWithItems);

module.exports = router;


