const db = require('../config/database');

// Get all districts
const getAllDistricts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM districts ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ success: false, message: 'Error fetching districts' });
  }
};

// Get single district
const getDistrict = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM districts WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching district:', error);
    res.status(500).json({ success: false, message: 'Error fetching district' });
  }
};

// Create district
const createDistrict = async (req, res) => {
  try {
    const { district_code, district_name, state, zone_region, active_status, remarks } = req.body;
    
    if (!district_code || !district_name) {
      return res.status(400).json({ success: false, message: 'District code and name are required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO districts (district_code, district_name, state, zone_region, active_status, remarks) VALUES (?, ?, ?, ?, ?, ?)',
      [district_code, district_name, state, zone_region, active_status || 'Active', remarks]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'District created successfully',
      data: { id: result.insertId, ...req.body }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'District code already exists' });
    }
    console.error('Error creating district:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating district' });
  }
};

// Update district
const updateDistrict = async (req, res) => {
  try {
    const { district_code, district_name, state, zone_region, active_status, remarks } = req.body;
    
    const [result] = await db.query(
      'UPDATE districts SET district_code = ?, district_name = ?, state = ?, zone_region = ?, active_status = ?, remarks = ? WHERE id = ?',
      [district_code, district_name, state, zone_region, active_status, remarks, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }
    
    res.json({ success: true, message: 'District updated successfully' });
  } catch (error) {
    console.error('Error updating district:', error);
    res.status(500).json({ success: false, message: 'Error updating district' });
  }
};

// Delete district
const deleteDistrict = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM districts WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }
    
    res.json({ success: true, message: 'District deleted successfully' });
  } catch (error) {
    console.error('Error deleting district:', error);
    res.status(500).json({ success: false, message: 'Error deleting district' });
  }
};

module.exports = {
  getAllDistricts,
  getDistrict,
  createDistrict,
  updateDistrict,
  deleteDistrict
};
