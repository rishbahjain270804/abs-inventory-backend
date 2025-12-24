const express = require('express');
const router = express.Router();
const {
  getAllLedgers,
  getLedger,
  createLedger,
  updateLedger,
  deleteLedger
} = require('../controllers/ledgerController');

router.get('/', getAllLedgers);
router.get('/:id', getLedger);
router.post('/', createLedger);
router.put('/:id', updateLedger);
router.delete('/:id', deleteLedger);

module.exports = router;
