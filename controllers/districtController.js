const District = require('../models/District');

// Get all districts
const getAllDistricts = async (req, res) => {
  try {
    const districts = await District.find().sort({ createdAt: -1 });
    res.json(districts);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ message: 'Error fetching districts' });
  }
};

// Get single district
const getDistrict = async (req, res) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }
    res.json(district);
  } catch (error) {
    console.error('Error fetching district:', error);
    res.status(500).json({ message: 'Error fetching district' });
  }
};

// Create district
const createDistrict = async (req, res) => {
  try {
    const district = new District(req.body);
    await district.save();
    res.status(201).json(district);
  } catch (error) {
    console.error('Error creating district:', error);
    res.status(500).json({ message: 'Error creating district' });
  }
};

// Update district
const updateDistrict = async (req, res) => {
  try {
    const district = await District.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }
    res.json(district);
  } catch (error) {
    console.error('Error updating district:', error);
    res.status(500).json({ message: 'Error updating district' });
  }
};

// Delete district
const deleteDistrict = async (req, res) => {
  try {
    const district = await District.findByIdAndDelete(req.params.id);
    if (!district) {
      return res.status(404).json({ message: 'District not found' });
    }
    res.json({ message: 'District deleted successfully' });
  } catch (error) {
    console.error('Error deleting district:', error);
    res.status(500).json({ message: 'Error deleting district' });
  }
};

module.exports = {
  getAllDistricts,
  getDistrict,
  createDistrict,
  updateDistrict,
  deleteDistrict
};
