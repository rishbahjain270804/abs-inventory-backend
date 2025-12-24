const Ledger = require('../models/Ledger');

// Get all ledgers
const getAllLedgers = async (req, res) => {
  try {
    const ledgers = await Ledger.find()
      .populate('district_id', 'district_name')
      .sort({ createdAt: -1 });
    res.json(ledgers);
  } catch (error) {
    console.error('Error fetching ledgers:', error);
    res.status(500).json({ message: 'Error fetching ledgers' });
  }
};

// Get single ledger
const getLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findById(req.params.id)
      .populate('district_id', 'district_name');
    if (!ledger) {
      return res.status(404).json({ message: 'Ledger not found' });
    }
    res.json(ledger);
  } catch (error) {
    console.error('Error fetching ledger:', error);
    res.status(500).json({ message: 'Error fetching ledger' });
  }
};

// Create ledger
const createLedger = async (req, res) => {
  try {
    const ledger = new Ledger(req.body);
    await ledger.save();
    const populated = await Ledger.findById(ledger._id)
      .populate('district_id', 'district_name');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating ledger:', error);
    res.status(500).json({ message: 'Error creating ledger' });
  }
};

// Update ledger
const updateLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('district_id', 'district_name');
    
    if (!ledger) {
      return res.status(404).json({ message: 'Ledger not found' });
    }
    res.json(ledger);
  } catch (error) {
    console.error('Error updating ledger:', error);
    res.status(500).json({ message: 'Error updating ledger' });
  }
};

// Delete ledger
const deleteLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findByIdAndDelete(req.params.id);
    if (!ledger) {
      return res.status(404).json({ message: 'Ledger not found' });
    }
    res.json({ message: 'Ledger deleted successfully' });
  } catch (error) {
    console.error('Error deleting ledger:', error);
    res.status(500).json({ message: 'Error deleting ledger' });
  }
};

module.exports = {
  getAllLedgers,
  getLedger,
  createLedger,
  updateLedger,
  deleteLedger
};
