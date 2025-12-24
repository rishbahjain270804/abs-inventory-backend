const express = require('express');
const router = express.Router();
const {
  getAllDistricts,
  getDistrict,
  createDistrict,
  updateDistrict,
  deleteDistrict
} = require('../controllers/districtController');

router.get('/', getAllDistricts);
router.get('/:id', getDistrict);
router.post('/', createDistrict);
router.put('/:id', updateDistrict);
router.delete('/:id', deleteDistrict);

module.exports = router;
