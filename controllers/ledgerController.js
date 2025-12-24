const db = require('../config/database');

// Get all ledgers with district name
const getAllLedgers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.*, d.district_name 
      FROM ledgers l 
      LEFT JOIN districts d ON l.district_id = d.id 
      ORDER BY l.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching ledgers:', error);
    res.status(500).json({ success: false, message: 'Error fetching ledgers' });
  }
};

// Get single ledger
const getLedger = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.*, d.district_name 
      FROM ledgers l 
      LEFT JOIN districts d ON l.district_id = d.id 
      WHERE l.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Party not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching ledger:', error);
    res.status(500).json({ success: false, message: 'Error fetching party' });
  }
};

// Create ledger
const createLedger = async (req, res) => {
  try {
    const { 
      party_code, party_name, party_type, address, district_id, state, 
      gstin, pan, contact_person, mobile_number, email, ledger_mapping, active_status 
    } = req.body;
    
    if (!party_code || !party_name) {
      return res.status(400).json({ success: false, message: 'Party code and name are required' });
    }
    
    const [result] = await db.query(
      `INSERT INTO ledgers (party_code, party_name, party_type, address, district_id, state, 
        gstin, pan, contact_person, mobile_number, email, ledger_mapping, active_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [party_code, party_name, party_type, address, district_id || null, state, 
       gstin, pan, contact_person, mobile_number, email, ledger_mapping, active_status || 'Active']
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'Party created successfully',
      data: { id: result.insertId, ...req.body }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Party code already exists' });
    }
    console.error('Error creating ledger:', error);
    res.status(500).json({ success: false, message: 'Error creating party' });
  }
};

// Update ledger
const updateLedger = async (req, res) => {
  try {
    const { 
      party_code, party_name, party_type, address, district_id, state, 
      gstin, pan, contact_person, mobile_number, email, ledger_mapping, active_status 
    } = req.body;
    
    const [result] = await db.query(
      `UPDATE ledgers SET party_code = ?, party_name = ?, party_type = ?, address = ?, 
       district_id = ?, state = ?, gstin = ?, pan = ?, contact_person = ?, 
       mobile_number = ?, email = ?, ledger_mapping = ?, active_status = ? 
       WHERE id = ?`,
      [party_code, party_name, party_type, address, district_id || null, state, 
       gstin, pan, contact_person, mobile_number, email, ledger_mapping, active_status, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Party not found' });
    }
    
    res.json({ success: true, message: 'Party updated successfully' });
  } catch (error) {
    console.error('Error updating ledger:', error);
    res.status(500).json({ success: false, message: 'Error updating party' });
  }
};

// Delete ledger
const deleteLedger = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM ledgers WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Party not found' });
    }
    
    res.json({ success: true, message: 'Party deleted successfully' });
  } catch (error) {
    console.error('Error deleting ledger:', error);
    res.status(500).json({ success: false, message: 'Error deleting party' });
  }
};

module.exports = {
  getAllLedgers,
  getLedger,
  createLedger,
  updateLedger,
  deleteLedger
};
