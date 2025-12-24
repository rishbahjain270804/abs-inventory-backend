const db = require('../config/database');

const getAllDistricts = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM districts ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching districts:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching districts' });
  }
};

const getDistrict = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM districts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching district' });
  }
};

const createDistrict = async (req, res) => {
  try {
    const { district_code, district_name, state, postal_code, zone_region, active_status, remarks } = req.body;

    if (!district_code || !district_name) {
      return res.status(400).json({ success: false, message: 'District code and name are required' });
    }

    const [result] = await db.query(
      `INSERT INTO districts (district_code, district_name, state, postal_code, zone_region, active_status, remarks) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [district_code, district_name, state, postal_code, zone_region, active_status || 'Active', remarks]
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
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateDistrict = async (req, res) => {
  try {
    const { district_code, district_name, state, postal_code, zone_region, active_status, remarks } = req.body;

    const [result] = await db.query(
      `UPDATE districts SET district_code = ?, district_name = ?, state = ?, postal_code = ?, 
       zone_region = ?, active_status = ?, remarks = ?, updated_at = NOW() WHERE id = ?`,
      [district_code, district_name, state, postal_code, zone_region, active_status, remarks, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }
    res.json({ success: true, message: 'District updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating district' });
  }
};

const deleteDistrict = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM districts WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }
    res.json({ success: true, message: 'District deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting district' });
  }
};

module.exports = { getAllDistricts, getDistrict, createDistrict, updateDistrict, deleteDistrict };
